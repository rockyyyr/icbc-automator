if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: '.env' });
}

module.exports = {
    development: {
        client: 'pg',
        connection: process.env.DATABASE_URL,
    },
    production: {
        client: 'pg',
        connection: {
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false,
            }
        },
        pool: {
            min: 0,
            max: 2,
        },
    }
};
