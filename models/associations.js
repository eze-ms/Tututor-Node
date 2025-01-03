const Clase = require('./Clases');
const Subcategoria = require('./Subcategorias');
const ClaseSubcategoria = require('./ClaseSubcategoria');

// Definir relaciones many-to-many correctamente
Clase.belongsToMany(Subcategoria, { through: ClaseSubcategoria, as: 'subcategorias' });
Subcategoria.belongsToMany(Clase, { through: ClaseSubcategoria });

// Exportar modelos con relaciones configuradas
module.exports = { Clase, Subcategoria, ClaseSubcategoria };