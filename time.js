const Moment = require('moment-timezone');

const dateFormat = 'YYYY-MM-DD';
const dateTimeFormat = 'YYYY-MM-DD HH:mm';

const toMoment = (...args) => Moment(...args).tz('America/Vancouver');
const icbcToMoment = (date, time) => toMoment(`${date} ${time}`, dateTimeFormat);
const isBetween = (moment, start, end) => moment.isBetween(start, end, undefined, '[]');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    dateFormat,
    dateTimeFormat,
    toMoment,
    icbcToMoment,
    isBetween,
    wait
};
