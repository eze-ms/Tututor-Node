const express = require('express')
const router = express.Router()

const homeController = require('../controllers/homeController')
const usuariosController = require('../controllers/usuariosController')
const authController = require('../controllers/authController')
const adminController = require('../controllers/adminController')
const clasesController = require('../controllers/clasesController')
const clasesControllerFE = require('../controllers/frontend/claseControllerFE')
const comentariosControllerFE = require('../controllers/frontend/comentariosControllerFE')
const busquedaControllerFE = require('../controllers/frontend/busquedaControllerFE')
const usuariosControllerFE = require('../controllers/frontend/usuariosControllerFE')

module.exports = function() {

  //!//////////////!/
  //! AREA PÚBLICA //
  /!//////////////!/
  router.get('/', homeController.home)

  //? Muestra una clase en el frontend
  router.get('/clase/:slug',
    clasesControllerFE.mostrarClase
  )

  //? Confirma interés por la clase
  router.post('/confirmar-interes/:slug',
     clasesControllerFE.confirmarInteres
  )

  //? Muestra interesados a la clase
  router.get('/interesados/:slug',
    clasesControllerFE.mostrarInteresandos
  )

  //? Muestra perfil en el frontend
  router.get('/usuarios/:id', 
    usuariosControllerFE.mostrarUsuario
  )

  //? Muestra clases por subcategorías
  router.get('/clases/:subcategoria',
    clasesControllerFE.mostrarSubcategoria
  )

  //? Agrega comentarios en la clase
  router.post('/clase/:id',
    comentariosControllerFE.agregarComentario
  )
  //? Elimina comentarios en la clase
  router.post('/eliminar-comentario',
    comentariosControllerFE.eliminarComentario
  )

  //? Añade la búsqueda
  router.get('/busqueda',
    busquedaControllerFE.resultadosBusqueda
  )

  //? Crear y confirmar cuentas
  router.get('/crear-cuenta', usuariosController.formCrearCuenta)
  router.post('/crear-cuenta', usuariosController.validarNuevaCuenta, usuariosController.crearNuevaCuenta)
  router.get('/confirmar-cuenta/:correo', usuariosController.confirmarCuenta)

  //? Pregunta si el usuario es profesor o alumno después de confirmar la cuenta
  router.get('/rol-usuario', usuariosControllerFE.SeleccionarRolUsuario);

  //? Asignar al usuario su rol
  router.post('/asignar-rol', 
    authController.usuarioAutenticado,
    usuariosControllerFE.procesarRolUsuario);

  //? Iniciar sesión
  router.get('/iniciar-sesion', usuariosController.formIniciarSesion)
  router.post('/iniciar-sesion', authController.autenticarUsuario)

  //? Home (nueva ruta)
  router.get('/', homeController.home);  // La ruta raíz debería llamar a la función 'home' del controlador

  //? Cerrar sesión
  router.get('/cerrar-sesion', 
    authController.usuarioAutenticado,
    authController.cerrarSesion
  )

  //!//////////////!/
  //! AREA PRIVADA //
  /!//////////////!/

  //? Panel de administración PROFESOR
  router.get('/administracion', 
    authController.usuarioAutenticado,
    adminController.panelAdministracion
  )
  //? Panel de administración ALUMNO
  router.get('/panel-alumno',
    authController.usuarioAutenticado,
    adminController.panelAdministracionAlumno
  )

  //? Nuevas clases
  router.get('/nueva-clase',
    authController.usuarioAutenticado,
    clasesController.formNuevaClase
  )
  router.post('/nueva-clase', 
    authController.usuarioAutenticado,
    clasesController.subirImagen,
    clasesController.crearClase
  )

  //? Editar Clases
  router.get('/editar-clase/:claseId',
    authController.usuarioAutenticado,
    clasesController.formEditarClase
  )
    router.post('/editar-clase/:claseId',
      authController.usuarioAutenticado,
      clasesController.editarClase
  )

  //? Editar la imagen
  router.get('/imagen-clase/:claseId',
    authController.usuarioAutenticado,
    clasesController.formEditarImagen
  )
  router.post('/imagen-clase/:claseId',
    authController.usuarioAutenticado,
    clasesController.subirImagen,
    clasesController.editarImagen
  )

  //? Eliminar clases
  router.post('/eliminar-clase/:claseId',
    authController.usuarioAutenticado,
    clasesController.eliminarClase
  )

  //? Editar información de perfil
  router.get('/editar-perfil',
    authController.usuarioAutenticado,
    usuariosController.formEditarPerfil
  )
  router.post('/editar-perfil',
    authController.usuarioAutenticado,
    usuariosController.subirImagen, // Subir la imagen del perfil
    usuariosController.editarPerfil // Guardar cambios del perfil
);

  //? Modifica el password
  router.get('/cambiar-password',
    authController.usuarioAutenticado,
    usuariosController.formCambiarPassword
  )
  router.post('/cambiar-password',
    authController.usuarioAutenticado,
    usuariosController.cambiarPassword
  )

  return router
}
