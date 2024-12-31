const Sequelize = require('sequelize');
const db = require('../config/db');
const Clase = require('./Clases');
const Subcategoria = require('./Subcategorias');

// Definir el modelo para la tabla intermedia
const ClaseSubcategoria = db.define('ClaseSubcategoria', {
  claseId: {
    type: Sequelize.UUID,
    references: {
      model: Clase,
      key: 'id'
    }
  },
  subcategoriaId: {
    type: Sequelize.INTEGER,
    references: {
      model: Subcategoria,
      key: 'id'
    }
  }
}, {
  timestamps: false // No necesitamos timestamps para esta tabla intermedia
});

module.exports = ClaseSubcategoria;
