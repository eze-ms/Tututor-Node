const Clase = require('../../models/Clases')
const Usuarios = require('../../models/Usuarios')
const Subcategorias = require('../../models/Subcategorias')
const Comentarios = require('../../models/Comentarios')
const Sequelize = require('sequelize')

// Función para capitalizar la primera letra de una palabra
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

 exports.mostrarClase = async (req, res) => {
  try {
    const clase = await Clase.findOne({
      where: { slug: req.params.slug },
      include: [
        {
          model: Usuarios,
          attributes: ['id', 'nombre', 'about', 'imagen', 'niveles', 'tarifa']
        },
        {
          model: Subcategorias,
          as: 'subcategorias',
          attributes: ['nombre']
        }
      ]
    })

    if (!clase) {
      return res.redirect('/'); // Si no se encuentra la clase, redirigir al home
    }

    const comentarios = await Comentarios.findAll({
      where: { claseId: clase.id },
      include: [{ model: Usuarios, attributes: ['id', 'nombre', 'imagen'] }]
    })

    let nivelesCapitalizados = [];
    if (typeof clase.usuario.niveles === 'string') {
      nivelesCapitalizados = clase.usuario.niveles
        .split(',')
        .map(nivel => capitalizeFirstLetter(nivel.trim()));
    }

    res.render('mostrar-clase', {
      nombrePagina: clase.nombre,
      clase,
      subcategorias: clase.subcategorias,
      lugar: clase.ubicacion,
      niveles: nivelesCapitalizados,
      tarifa: clase.usuario.tarifa,
      comentarios,
      usuario: req.user // Enviar req.user pero la vista no depende de él para renderizarse
    })
  } catch (error) {
    console.error('Error al mostrar la clase:', error)
    res.status(500).send('Hubo un error al cargar la clase.')
  }
}

//! Muestra las clases agrupadas por subcategorías
exports.mostrarSubcategoria = async (req, res) => {
  try {
    const subcategoria = await Subcategorias.findOne({
      attributes: ['id', 'nombre'],
      where: { slug: req.params.subcategoria }
    })
    

    

    if (!subcategoria) {
      req.flash('error', 'Subcategoría no encontrada')
      return res.redirect('/')
    }

    // Traer las clases que están asociadas a esta subcategoría a través de la tabla intermedia
    const clases = await Clase.findAll({
      include: [
        {
          model: Subcategorias, // Relación many-to-many
          as: 'subcategorias',  // Alias correcto
          where: { id: subcategoria.id }  // Filtrar por la subcategoría
        },
        {
          model: Usuarios, // Incluir el modelo Usuarios
          attributes: ['nombre', 'imagen', 'tarifa', 'ubicacion', 'about']
        }
      ]
    })

    res.render('subcategoria', {
      nombrePagina: `Tus tutores de: ${subcategoria.nombre}`,
      clases
    });
  } catch (error) {
    console.error('Error al mostrar la subcategoría:', error)
    res.status(500).send('Hubo un error al cargar la subcategoría.')
  }
}

//! Confirma o cancela si al usuario le interesa la clase
exports.confirmarInteres = async (req, res) => {
  const { accion } = req.body;
  const { slug } = req.params;

  try {
    // Definir la operación según la acción
    const operacion = accion === 'confirmar' 
      ? Sequelize.fn('array_append', Sequelize.col('interesados'), req.user.id)
      : Sequelize.fn('array_remove', Sequelize.col('interesados'), req.user.id);

    // Actualizar los interesados en la clase
    await Clase.update(
      { 'interesados': operacion },
      { 'where': { 'slug': slug } }
    );

    // Enviar respuesta según la acción
    const mensaje = accion === 'confirmar' 
      ? 'Interés confirmado'
      : 'Has cancelado tu interés';
    
    res.json({ mensaje });

  } catch (error) {
    console.error('Error al actualizar el interés:', error);
    res.status(500).json({ error: 'Hubo un problema al procesar tu solicitud' });
  }
};


//! Muestra el listado de los interesados
exports.mostrarInteresandos = async (req, res) => {
  try {
    // Buscar la clase y obtener los interesados
    const clase = await Clase.findOne({
      where: {
        slug: req.params.slug
      },
      attributes: ['interesados']
    });

    // Extraer interesados como un array de IDs
    const { interesados } = clase;

    // Buscar los usuarios interesados
    const usuariosInteresados = await Usuarios.findAll({
      attributes: ['nombre', 'imagen'],
      where: {
        id: interesados  // Buscar todos los usuarios cuyos ID estén en el array 'interesados'
      }
    });

    // Pasar los datos a la vista
    res.render('interesados-clase', {
      nombrePagina: 'Listado de interesados',
      interesados: usuariosInteresados  // Pasar los usuarios encontrados
    });

  } catch (error) {
    console.error('Error al mostrar interesados:', error);
    res.status(500).send('Hubo un error al cargar los interesados.');
  }
};
