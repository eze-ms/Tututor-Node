const Sequelize = require('sequelize');
const db = require('../config/db');
const Categoria = require('./Categorias');

const Subcategorias = db.define('subcategorias', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: Sequelize.STRING,
    allowNull: false
  },
  categoriaId: {
    type: Sequelize.INTEGER,
    references: {
      model: Categoria,
      key: 'id'
    }
  },
  slug: Sequelize.STRING
}, {
  timestamps: false
});

Subcategorias.belongsTo(Categoria);
Categoria.hasMany(Subcategorias, { as: 'subcategorias' });

module.exports = Subcategorias;
