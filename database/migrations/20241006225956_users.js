/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('user_accounts', table => {
        table.increments('id').primary();
        table.string('lastname');
        table.string('keyword');
        table.string('licence');
        table.string('authToken');
        table.integer('threshold').defaultTo(1);
        table.boolean('enabled').defaultTo(true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('user_accounts');
};
