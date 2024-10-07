if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const { PORT, INTERVAL_MINS, TELEGRAM_BOT_API_KEY } = process.env;

require('express')().listen(PORT || 3000); //bind port for heroku

const ICBC = require('./icbc');
const Users = require('./users');
const Locations = require('./locations.json');
const Time = require('./time');
const TelegramBot = require('./telegram');
const tg = new TelegramBot(TELEGRAM_BOT_API_KEY);

async function run() {
    try {
        const user = await Users.get();

        if (!user) {
            return;
        }

        const icbc = new ICBC(user);
        await icbc.login();

        let foundResults = false;

        await tg.sendMessage(`
            <b>Appointment Available</b>
            <b>Location:</b> Test message!!!!!
            <b>Time:</b> ${Time.toMoment().format(Time.displayFormat)}
            <b></b>
            <a href="https://onlinebusiness.icbc.com/webdeas-ui/home"><b>Book Now!</b></a>
        `);

        for (const location of Locations) {
            const results = await icbc.appointmentsByLocation(location);

            if (results.length > 0) {
                foundResults = true;

                console.log(results);

                for (const result of results) {
                    await tg.sendMessage(`
                        <b>Appointment Available</b>
                        <b>Location:</b> ${location.name}
                        <b>Time:</b> ${result.time.format(Time.displayFormat)}
                        <b></b>
                        <a href="https://onlinebusiness.icbc.com/webdeas-ui/home"><b>Book Now!</b></a>
                    `);
                }
            }

            Time.wait(1000);
        }

        if (!foundResults) {
            console.log('No appointments found');
        }

    } catch (error) {
        console.error(error);
    }
}

(() => {
    run();
    setInterval(run, INTERVAL_MINS * 60 * 1000);
})();
