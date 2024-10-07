const Moment = require('moment-timezone');

const dateFormat = 'YYYY-MM-DD';
const dateTimeFormat = 'YYYY-MM-DD HH:mm';
const displayFormat = 'YYYY-MM-DD HH:mm:ss';

const toMoment = (...args) => Moment(...args).tz('America/Vancouver');
const icbcToMoment = (date, time) => toMoment(`${date} ${time}`, dateTimeFormat);
const isBetween = (moment, start, end) => moment.isBetween(start, end, undefined, '[]');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    dateFormat,
    dateTimeFormat,
    displayFormat,
    toMoment,
    icbcToMoment,
    isBetween,
    wait
};
