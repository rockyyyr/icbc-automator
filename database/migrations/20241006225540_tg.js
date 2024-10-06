exports.up = function (knex) {
    return knex.schema.createTable('telegram_bot', (tables) => {
        tables.string('chatId');
        tables.string('botKey');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('telegram_bot');
};
