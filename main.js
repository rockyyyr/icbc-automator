if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const { PORT, LASTNAME, KEYWORD, LICENCE, INTERVAL_MINS } = process.env;

require('express')().listen(PORT || 3000); //bind port for heroku

const ICBC = require('./icbc');
const Locations = require('./data/locations.json');
const Time = require('./time');

async function run() {
    try {
        const icbc = new ICBC(LASTNAME, KEYWORD, LICENCE);
        await icbc.login();

        console.log(icbc);

        for (const location of Locations) {
            const result = await icbc.appointmentsByLocation(location);
            console.log(result);
            Time.wait(1000);
        }

    } catch (error) {
        console.error(error);
    }
}

(() => {
    run();
    setInterval(run, INTERVAL_MINS * 60 * 1000);
})();