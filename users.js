const db = require('./database');

function updateAuthToken(lastname, authToken) {
    return db('user_accounts')
        .where({ lastname })
        .update({ authToken });
}

function get() {
    return db('user_accounts').select().where({ enabled: true }).first();
}

function disable(lastname) {
    return db('user_accounts')
        .where({ lastname })
        .update({ enabled: false });
}

module.exports = {
    updateAuthToken,
    get,
    disable
};
