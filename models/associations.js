const Clase = require('./Clases');
const Subcategoria = require('./Subcategorias');
const ClaseSubcategoria = require('./ClaseSubcategoria');

// Definir las relaciones many-to-many entre Clases y Subcategorias
Clase.belongsToMany(Subcategoria, { through: ClaseSubcategoria, as: 'subcategorias' });
Subcategoria.belongsToMany(Clase, { through: ClaseSubcategoria });

// Exportar los modelos para usarlos en otros archivos si es necesario
module.exports = { Clase, Subcategoria, ClaseSubcategoria };