const { Sequelize } = require('sequelize');
require('dotenv').config({ path: 'variables.env' });

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    logging: false,
});

module.exports = sequelize;
