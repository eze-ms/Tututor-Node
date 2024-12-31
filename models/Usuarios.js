const Sequelize = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcrypt-nodejs');

const Usuarios = db.define('usuarios', {
    id: {
        type: Sequelize.INTEGER, 
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: Sequelize.STRING(60),
        allowNull: false
    },
    apellido: {
        type: Sequelize.STRING(60)
    },
    fecha_nacimiento: {
        type: Sequelize.DATE
    },
    tarifa: {
        type: Sequelize.STRING(20), 
    },
    niveles: {
        type: Sequelize.STRING(100), 
        allowNull: true
    },
    ubicacion: {
        type: Sequelize.STRING(100),
        allowNull: true
    },
    imagen: {
        type: Sequelize.STRING(60)
    },
    about: {
        type: Sequelize.TEXT
    },
    email: {
        type: Sequelize.STRING(30),
        allowNull: false, 
        validate: {
            isEmail: { msg: 'Agrega un correo válido' }
        },
        unique: {
            args: true,
            msg: 'Usuario ya registrado'
        }
    },
    password: {
        type: Sequelize.STRING(60),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El password no puede ir vacío'
            }
        }
    }, 
    activo: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    tokenPassword: {
        type: Sequelize.STRING
    },
    expiraToken: {
        type: Sequelize.DATE
    },
    rol: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, {
    hooks: {
        beforeCreate(usuario) { 
            usuario.password = Usuarios.prototype.hashPassword(usuario.password);
        }
    }
});
// Métodos personalizados para hashing de contraseñas
Usuarios.prototype.validarPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

Usuarios.prototype.hashPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

module.exports = Usuarios;
