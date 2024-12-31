const { DataTypes } = require('sequelize'); // Importar DataTypes directamente
const db = require('../config/db');
const Usuarios = require('./Usuarios');
const Clase = require('./Clases');

const Comentarios = db.define('Comentarios', {
  id: {
    type: DataTypes.INTEGER,  // Usar DataTypes directamente
    primaryKey: true,
    autoIncrement: true
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false 
  }
}, {
  timestamps: false
});

// Definir asociaciones
Comentarios.belongsTo(Usuarios, { foreignKey: 'usuarioId' });
Comentarios.belongsTo(Clase, { foreignKey: 'claseId' });

module.exports = Comentarios;
