const db = require('./database');

function updateAuthToken(lastname, authToken) {
    return db('users')
        .where({ lastname })
        .update({ authToken });
}

function get() {
    return db('users').select().where({ enabled: true }).first();
}

function disable(lastname) {
    return db('users')
        .where({ lastname })
        .update({ enabled: false });
}

module.exports = {
    updateAuthToken,
    get,
    disable
};
