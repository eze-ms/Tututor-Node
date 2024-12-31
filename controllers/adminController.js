const Sequelize = require('sequelize'); 
const Clases = require('../models/Clases');
const Usuarios = require('../models/Usuarios');

exports.panelAdministracion = async (req, res) => {
  try {
    // Obtener el usuario autenticado y las clases
    const usuario = await Usuarios.findByPk(req.user.id);
    const clases = await Clases.findAll({ where: { usuarioId: req.user.id } });

    if (!usuario) {
      req.flash('error', 'Usuario no encontrado');
      return res.redirect('/iniciar-sesion');
    }

    // Renderizar la vista con las clases y el usuario
    res.render('administracion', {
      nombrePagina: 'Panel de administración',
      usuario,  // Pasa el objeto usuario a la vista
      clases
    });


  } catch (error) {
    req.flash('error', 'Hubo un error al cargar el panel de administración');
    return res.redirect('/iniciar-sesion');
  }
};

exports.panelAdministracionAlumno = async (req, res) => {
  try {
    // Obtener el usuario autenticado
    const usuario = await Usuarios.findByPk(req.user.id);
    
    if (!usuario) {
      req.flash('error', 'Usuario no encontrado');
      return res.redirect('/iniciar-sesion');
    }

    // Buscar las clases donde el usuario ha mostrado interés e incluir los datos del usuario y de la clase
    const clasesGustadas = await Clases.findAll({
      where: {
        interesados: {
          [Sequelize.Op.contains]: [usuario.id]  // Buscar clases donde el usuario ha mostrado interés
        }
      },
      include: [
        {
          model: Usuarios,  // Incluir el modelo Usuarios
          as: 'usuario',    // No estamos usando un alias personalizado, Sequelize usará 'usuario' por defecto
          attributes: ['nombre', 'tarifa', 'imagen']  // Obtener también la tarifa e imagen del usuario
        }
      ]
    });

    // Renderizar la vista del panel del alumno
    res.render('panel-alumno', {
      nombrePagina: 'Panel de Alumno',
      usuario,  // Pasamos los datos del usuario autenticado
      clasesGustadas // Pasamos las clases que le han gustado al usuario
    });

  } catch (error) {
    console.error('Error al cargar el panel de alumno:', error);
    req.flash('error', 'Hubo un error al cargar el panel de alumno');
    return res.redirect('/iniciar-sesion');
  }
};
