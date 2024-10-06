const config = require('./knexfile');
const env = process.env.NODE_ENV;
const knex = require('knex')(config[env]);

module.exports = knex;
