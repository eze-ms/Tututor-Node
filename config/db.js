const { Sequelize } = require('sequelize');
require('dotenv').config({ path: 'variables.env' });

// Verificar el valor de la variable de entorno
console.log('DATABASE_URL:', process.env.DATABASE_URL);

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
