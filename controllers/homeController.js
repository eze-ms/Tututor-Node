const Categorias = require('../models/Categorias')
const Subcategorias = require('../models/Subcategorias')
const Clases = require('../models/Clases')
const Usuarios = require('../models/Usuarios')

// Función para truncar texto por número de palabras y añadir puntos suspensivos
function truncateWords(text, limit) {
  const words = text.split(' ')
  if (words.length > 15) {
    return words.slice(0, 15).join(' ') + '...'
  }
  return text
}

exports.home = async (req, res) => {
  try {
    // Mapeo de subcategorías a los iconos correspondientes
    const iconos = {
      'Inglés': 'img/iconos/en.svg',
      'Guitarra': 'img/iconos/guitarra.svg',
      'Matemáticas': 'img/iconos/mat.svg',
      'Canto': 'img/iconos/canto.svg',
      'Fútbol': 'img/iconos/futbol.svg',
      'Ajedrez': 'img/iconos/ajedrez.svg',
      'Paddle': 'img/iconos/paddle.svg',
      'Ciencias': 'img/iconos/ciencias.svg',
      'Fotografía': 'img/iconos/camera.svg',
      'Entreno': 'img/iconos/entrenamiento.svg',
      'Baile': 'img/iconos/baile.png',
      'Programación': 'img/iconos/codigo.png',
      'Yoga': 'img/iconos/yoga.png'
    }

    // Consultar categorías, subcategorías y clases
    const [categorias, subcategorias, clases] = await Promise.all([
      Categorias.findAll(),
      Subcategorias.findAll(),
      Clases.findAll({
        attributes: ['nombre', 'imagen', 'slug', 'ubicacion'],  // Incluir la ubicación de la clase
        include: [
          {
            model: Usuarios,
            attributes: ['nombre', 'imagen', 'tarifa', 'ubicacion', 'about']
          }
        ],
        limit: 10
      })
    ])

    // Extraer las ubicaciones únicas de las clases
    const ubicaciones = clases
      .map(clase => clase.ubicacion)
      .filter((value, index, self) => value && self.indexOf(value) === index)  // Filtrar ubicaciones únicas no nulas

    // Truncar las descripciones de cada usuario por palabras
    clases.forEach(clase => {
      if (clase.usuario && clase.usuario.about) {
        clase.usuario.about = truncateWords(clase.usuario.about, 20)
      }
    })

    // Filtrar subcategorías únicas con iconos
    const subcategoriasConIconos = subcategorias.filter((subcategoria, index, self) =>
      iconos[subcategoria.nombre] &&
      index === self.findIndex(s => s.nombre === subcategoria.nombre)
    )

    // Renderizar la vista home
res.render('home', {
    nombrePagina: 'Inicio',
    categorias,
    subcategoriasConIconos,
    iconos,
    clases,
    ubicaciones,
    mostrarModal: req.query.mostrarModal || false, // Modal activo o no
    mostrarCrearCuenta: req.query.mostrarCrearCuenta || false // Modal de crear cuenta
});

  } catch (error) {
    console.error('Error al cargar la home:', error)
    res.status(500).send('Hubo un error al cargar la página de inicio')
  }
}
