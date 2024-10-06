if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const { PORT, INTERVAL_MINS, TELEGRAM_BOT_API_KEY } = process.env;

require('express')().listen(PORT || 3000); //bind port for heroku

const ICBC = require('./icbc');
const Users = require('./users');
const Locations = require('./data/locations.json');
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

        for (const location of Locations) {
            const results = await icbc.appointmentsByLocation(location);

            if (results.length > 0) {
                for (const result of results) {
                    await tg.sendMessage(`
                        <b>Appointment Available</b>
                        <b>Location:</b> ${location.name}
                        <b>Time:</b> ${result.time.format(Time.displayFormat)}
                        <br>
                        <a href="https://onlinebusiness.icbc.com/webdeas-ui/home"><b>Book Now!</b></a>
                    `);
                }
            }

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
