const Usuarios = require('../../models/Usuarios');
const Clases = require('../../models/Clases');

exports.mostrarUsuario = async (req, res, next) => {
  try {
    // Ejecutar las consultas en paralelo
    const [usuario, clases] = await Promise.all([
      Usuarios.findOne({ 
        where: { id: req.params.id }
      }),
      Clases.findAll({  // `findAll` por si el usuario tiene varias clases
        where: { usuarioId: req.params.id }
      })
    ]);

    // Si el usuario no existe, redirigir
    if (!usuario) {
      return res.redirect('/');
    }

    // Renderizar la vista con el perfil del usuario y sus clases
    res.render('mostrar-perfil', {
      nombrePagina: `Perfil de: ${usuario.nombre}`,  
      usuario,
      clases
    });

  } catch (error) {
    console.error('Error al mostrar el perfil del usuario:', error);
    next(error);
  }
};

exports.SeleccionarRolUsuario = async (req, res, next) => {
  try {
    console.log("Usuario autenticado:", req.user);  // Verificar si req.user está disponible
    if (req.user && req.user.rol) {
      console.log("Usuario ya tiene rol:", req.user.rol);  // Depuración para ver si ya tiene rol
      if (req.user.rol === 'profesor') {
        return res.redirect('/administracion');
      } else if (req.user.rol === 'alumno') {
        return res.redirect('/panel-alumno');
      }
    }
    
    res.render('rol-usuario', {
      nombrePagina: 'Selecciona tu Rol'
    });

  } catch (error) {
    console.error('Error al seleccionar el rol del usuario:', error);
    next(error);
  }
};

exports.procesarRolUsuario = async (req, res) => {
    try {
        const usuario = await Usuarios.findByPk(req.user.id); // Encontrar al usuario autenticado

        if (!usuario) {
            req.flash('error', 'Usuario no encontrado');
            return res.redirect('/rol-usuario');
        }

        // Asignar el rol seleccionado
        usuario.rol = req.body.rol;  // 'profesor' o 'alumno'
        await usuario.save();  // Guardar el rol

        // Redirigir según el rol asignado
        if (usuario.rol === 'profesor') {
            return res.redirect('/administracion');  // Redirigir a panel de profesor
        } else if (usuario.rol === 'alumno') {
            return res.redirect('/panel-alumno');  // Redirigir a panel de alumno
        } else {
            req.flash('error', 'Rol no válido');
            return res.redirect('/rol-usuario');
        }
    } catch (error) {
        console.error('Error al asignar el rol:', error);
        req.flash('error', 'Hubo un error al asignar el rol');
        return res.redirect('/rol-usuario');
    }
};
