const { Sequelize } = require('sequelize');
require('dotenv').config({ path: 'variables.env' });

let sequelize;

if (process.env.DATABASE_URL) {
    // Configuración para producción
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false, // Permitir certificados autofirmados
            },
        },
        logging: false, // Desactivar logs en producción
    });
} else {
    // Configuración para desarrollo
    sequelize = new Sequelize(
        process.env.BD_NOMBRE, 
        process.env.BD_USER, 
        process.env.BD_PASS, 
        {
            host: process.env.BD_HOST,
            port: process.env.ND_PORT,
            dialect: 'postgres',
            logging: true, // Puedes activar logs para depuración en desarrollo
        }
    );
}

module.exports = sequelize;
