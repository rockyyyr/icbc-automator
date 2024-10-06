const axios = require('axios');
const Endpoints = require('./endpoints');
const Time = require('./time');

const ALL_DAYS = '[0,1,2,3,4,5,6]';
const ALL_TIMES = '[0,1]';

class ICBC {
    constructor(lastName, keyword, licence, newAppointmentThreshold = 1) {
        this.newAppointmentThreshold = newAppointmentThreshold;
        this.lastName = lastName;
        this.keyword = keyword;
        this.licence = licence;

        this.driverId = null;
        this.examType = null;
        this.email = null;
        this.phone = null;
        this.authToken = null;
        this.currentAppointmentDate = null;
        this.latestAcceptableDate = null;
        this.earliestAppointmentDate = null;
    }

    headers(endpoint) {
        const headers = {
            Dnt: 1,
            referer: endpoint.referer,
            Authorization: this.authToken,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
            'Content-Type': 'application/json',
        };

        if (this.authToken !== null) {
            headers.Authorization = this.authToken;
        }

        return headers;
    }

    request(endpoint, data) {
        return axios({
            method: endpoint.type,
            url: endpoint.url,
            headers: this.headers(endpoint),
            data
        });
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
