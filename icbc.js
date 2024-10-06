const axios = require('axios');
const Endpoints = require('./endpoints');
const Time = require('./time');
const Users = require('./users');

const ALL_DAYS = '[0,1,2,3,4,5,6]';
const ALL_TIMES = '[0,1]';

class ICBC {
    constructor(user) {
        this.newAppointmentThreshold = user.threshold;
        this.lastName = user.lastname;
        this.keyword = user.keyword;
        this.licence = user.licence;
        this.authToken = user.authToken;

        this.driverId = null;
        this.examType = null;
        this.email = null;
        this.phone = null;
        this.currentAppointmentDate = null;
        this.latestAcceptableDate = null;
        this.earliestAppointmentDate = null;
        this.loginAttempts = 0;
    }

    headers(endpoint) {
        const headers = {
            Dnt: 1,
            referer: endpoint.referer,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
            'Content-Type': 'application/json',
        };

        if (!endpoint.skipAuth) {
            headers.Authorization = this.authToken;
        }

        return headers;
    }

    async request(endpoint, data) {
        const doRequest = headers => {
            return axios({
                method: endpoint.type,
                url: endpoint.url,
                headers,
                data
            });
        };

        let response;

        try {
            response = await doRequest(this.headers(endpoint));

        } catch (error) {
            if (error.response.status === 403) {

                if (this.loginAttempts > 5) {
                    console.log('login attempts exceeded');

                    try {
                        await Users.disable(this.lastName);
                    } catch (error) {
                        console.log(error);
                    }
                    throw error;

                } else {
                    this.loginAttempts++;
                }

                try {
                    await this.login();
                    response = await doRequest(this.headers(endpoint));

                } catch (error) {
                    console.log(error);
                }

            } else {
                throw error;
            }
        }

        return response;
    }

    async login() {
        const response = await this.request(Endpoints.Login, {
            drvrLastName: this.lastName,
            keyword: this.keyword,
            licenceNumber: this.licence
        });

        const data = response.data;

        if (data.drvrId) {
            this.driverId = data.drvrId;
            this.email = data.email;
            this.phone = data.phoneNum;
            this.authToken = response.headers.authorization;

            await Users.updateAuthToken(this.lastName, this.authToken);

        } else {
            return Promise.reject(response);
        }

        if (Array.isArray(data.webAappointments) && data.webAappointments.length > 0) {
            const appointment = data.webAappointments[0];
            const date = appointment.appointmentDt.date;
            const time = appointment.startTm;

            this.currentAppointmentDate = Time.icbcToMoment(date, time);
            this.latestAcceptableDate = Time.toMoment(this.currentAppointmentDate).subtract(this.newAppointmentThreshold, 'days');
        }

        if (Array.isArray(data.eligibleExams) && data.eligibleExams.length > 0) {
            const exam = data.eligibleExams[0];
            const date = exam.eed.date;
            this.examType = exam.code;
            this.earliestAppointmentDate = Time.toMoment(date, Time.dateFormat);
        }

        console.log('successfully logged in');
        this.loginAttempts = 0;

        return response.data;
    }

    async appointmentsByLocation(location) {
        const data = {
            aPosID: location.id,
            examType: this.examType,
            examDate: this.earliestAppointmentDate.format(Time.dateFormat),
            ignoreReserveTime: false,
            prfDaysOfWeek: ALL_DAYS,
            prfPartsOfDay: ALL_TIMES,
            lastName: this.lastName,
            licenseNumber: this.licence
        };

        const response = await this.request(Endpoints.Search, data);

        return response.data
            ? response.data
                .map(a => ({ locationId: a.posId, time: Time.icbcToMoment(a.appointmentDt.date, a.startTm), signature: a.signature }))
                .filter(a => Time.isBetween(a.time, this.earliestAppointmentDate, this.latestAcceptableDate))
            : [];
    };
}

module.exports = ICBC;
