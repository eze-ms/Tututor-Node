// const { Sequelize } = require('sequelize');
// require('dotenv').config({ path: 'variables.env' });

// // Verificar el valor de la variable de entorno
// console.log('DATABASE_URL:', process.env.DATABASE_URL);

// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//     dialect: 'postgres',
//     dialectOptions: {
//         ssl: {
//             require: true,
//             rejectUnauthorized: false,
//         },
//     },
//     logging: false,
// });

// module.exports = sequelize;

const { Sequelize } = require('sequelize');
require('dotenv').config({ path: 'variables.env' });

const sequelize = new Sequelize(
    process.env.BD_NOMBRE, 
    process.env.BD_USER, 
    process.env.BD_PASS, 
    {
        host: process.env.BD_HOST,
        port: process.env.ND_PORT,
        dialect: 'postgres',
        logging: false
    }
);

module.exports = sequelize;

