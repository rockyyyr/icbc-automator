const TelegramBotApi = require('node-telegram-bot-api');
const db = require('./database');

const telegramBotChats = 'telegram_bot';

const BOT_KEY = process.env.TELEGRAM_BOT_KEY;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

module.exports = class TelegramBot {
    constructor(token) {
        if (token) {
            this.bot = new TelegramBotApi(token, { polling: true });
            this._init();
        } else {
            this.disabled = true;
        }
    }

    _init() {
        this.bot.on('error', console.error);
        this.bot.on('connect', console.error);

        this.bot.on('message', (message) => {
            Object.keys(Commands).forEach((command) => {
                try {
                    Commands[command].action(message, this.bot);
                } catch (err) {
                    console.error(err);
                    console.error('Command: ' + command);
                }
            });
            if (notEmpty(message) && message.text.trim() === '/poo') {
                this.bot.sendMessage(message.chat.id, '💩');
            }
        });

        this.bot.on('polling-error', (error) => {
            try {
                if (error.code === 'ETELEGRAM') {
                    this.bot.startPolling({ restart: true });
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    async sendMessage(message) {
        if (this.disabled) {
            return;
        }
        this._sendMessageToChat(message, TELEGRAM_CHAT_ID);
    }

    async _sendMessageToChat(message, chatId) {
        try {
            try {
                await this.bot.sendMessage(chatId, message, { parse_mode: 'html' });

            } catch (err) {
                console.error(err);
            }
        } catch (err) {
            console.error(err);
        }
    }

    _sendMessageToConsole(message) {
        console.log(`Telegram: ${message}`);
    }
};

const Commands = {
    SUBSCRIBE: {
        command: '/subscribe',
        action: subscribe,
    },
    UNSUBSCRIBE: {
        command: '/unsubscribe',
        action: unsubscribe,
    },
    PING: {
        command: '/hello',
        action: ping,
    },
    START: {
        command: '/start',
        action: toggle(true),
    },
    STOP: {
        command: '/stop',
        action: toggle(false),
    },
};

async function toggle(enabled) {
    return async (message, bot) => {
        if (notEmpty(message) && message.text.trim() === Commands.START.command) {
            try {
                const validated = await validateMessage(message);
                const result =
                    validated && (await db('storage').update({ enabled }).where('id', 'master').returning('id'));

                const response = result
                    ? `I have ${enabled ? 'enabled' : 'disabled'} the robot for you!😄`
                    : "Who are you? I'm not subscribed to this chat...";

                bot.sendMessage(message.chat.id, response);
            } catch (err) {
                error(err, message, bot);
            }
        }
    };
}

async function subscribe(message, bot) {
    if (notEmpty(message) && message.text.startsWith(Commands.SUBSCRIBE.command)) {
        const botKey = message.text.split(' ')[1];

        try {
            if (botKey === BOT_KEY) {
                await db.insert({ botKey, chatId: message.chat.id }, '*').into(telegramBotChats);
                const response = `Hey! Thanks for subscribing me to this chat! 😄\n\n`;

                bot.sendMessage(message.chat.id, response, { parse_mode: 'html' });
            } else {
                bot.sendMessage(message.chat.id, "Theres a problem. I couldn't find your bot key... 🤔");
            }
        } catch (err) {
            error(err, message, bot);
        }
    }
}

async function unsubscribe(message, bot) {
    if (notEmpty(message) && message.text.startsWith(Commands.UNSUBSCRIBE.command)) {
        try {
            await db(telegramBotChats).where('chatId', message.chat.id).del();
            bot.sendMessage(message.chat.id, 'I have unsubscribed from this chat. Goodbye!');
        } catch (error) {
            console.log(error);
            bot.sendMessage(message.chat.id, 'Something went wrong 😔');
        }
    }
}

async function ping(message, bot) {
    if (notEmpty(message) && message.text.trim() === Commands.PING.command) {
        try {
            const validated = await validateMessage(message);

            const response = validated
                ? 'Hello! I am subscribed to this chat! 😄'
                : "Who are you? I'm not subscribed to this chat...";

            bot.sendMessage(message.chat.id, response);
        } catch (err) {
            error(err, message, bot);
        }
    }
}

function notEmpty(message) {
    return message && message.text;
}

function error(err, message, bot) {
    bot.sendMessage(message.chat.id, 'Something went wrong 😔');
    console.error(err);
}

function validateMessage(message) {
    return !!db.select().from(telegramBotChats).where('chatId', message.chat.id);
}
