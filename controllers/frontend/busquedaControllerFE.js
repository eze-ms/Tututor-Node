const Clase = require('../../models/Clases')
const Subcategorias = require('../../models/Subcategorias')
const Usuarios = require('../../models/Usuarios')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

// Función para truncar texto por número de palabras y añadir puntos suspensivos
function truncateWords(text, limit) {
  const words = text.split(' ')
  if (words.length > 15) {
    return words.slice(0, 15).join(' ') + '...'
  }
  return text
}

exports.resultadosBusqueda = async (req, res) => {
  // Leer datos de la URL
  const { categoria, ubicacion } = req.query

  try {
    // Condiciones dinámicas para la búsqueda
    const whereClause = {
      ubicacion: { [Op.like]: '%' + ubicacion + '%' }  // Filtro por ubicación
    }

    // Si la categoría está definida, agregamos el filtro de categoría
    if (categoria) {
      whereClause.categoriaId = categoria
    }

    // Filtrar las clases por los términos de la búsqueda
    const clases = await Clase.findAll({
      where: whereClause,
      include: [
        {
          model: Usuarios,
          attributes: ['id', 'nombre', 'imagen', 'about', 'tarifa', 'ubicacion']
        },
        {
          model: Subcategorias,
          as: 'subcategorias',
          attributes: ['nombre']
        }
      ]
    })

    // Truncar las descripciones de cada usuario por palabras
    clases.forEach(clase => {
      if (clase.usuario && clase.usuario.about) {
        clase.usuario.about = truncateWords(clase.usuario.about, 20)
      }
    })

    // Pasar los resultados a la vista
    res.render('busqueda', {
      nombrePagina: 'Resultado de la búsqueda',
      clases
    })

  } catch (error) {
    console.error('Error en la búsqueda:', error)
    res.status(500).send('Error en la búsqueda')
  }
}
