const Sequelize = require('sequelize');
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const Categoria = require('./Categorias');
const Usuarios = require('./Usuarios');
const { DataTypes } = require('sequelize');


const Clase = db.define('clases', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: () => uuidv4()
  },
  nombre: {
    type: Sequelize.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La clase tiene que tener un nombre'
      }
    }
  },
  descripcion: {
    type: Sequelize.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Escribe una descripción'
      }
    }
  },
  ubicacion: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  interesados : {
            type: Sequelize.ARRAY(Sequelize.INTEGER),
            defaultValue : []
  },
  modalidad: {
    type: Sequelize.ENUM('Presencial', 'Online', 'Presencial/Online'),
    allowNull: false,
    defaultValue: 'Presencial'
  },
  imagen: {
    type: DataTypes.STRING(255),
    allowNull: true,
},
  slug: {
    type: Sequelize.STRING,
    allowNull: false
  }
});



Clase.belongsTo(Categoria, { as: 'categoria', foreignKey: 'categoriaId', onUpdate: 'CASCADE', onDelete: 'SET NULL' });
Clase.belongsTo(Usuarios, { foreignKey: 'usuarioId', onUpdate: 'CASCADE', onDelete: 'SET NULL' });

module.exports = Clase;
