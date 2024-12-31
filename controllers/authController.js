const passport = require('passport');
const Usuarios = require('../models/Usuarios');

// Autenticar usuario con Passport.js
exports.autenticarUsuario = (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err) {
            console.error('Error en la autenticación:', err);
            return next(err);
        }
        if (!user) {
            req.flash('error', 'Usuario o contraseña incorrectos');
            return res.redirect('/iniciar-sesion');
        }

        // Iniciar sesión
        req.logIn(user, async (err) => {
            if (err) {
                console.error('Error al iniciar sesión:', err);
                return next(err);
            }

            try {
                // Cargar el usuario completo con su rol desde la base de datos
                const usuario = await Usuarios.findByPk(user.id);

                if (!usuario) {
                    req.flash('error', 'Usuario no encontrado');
                    return res.redirect('/iniciar-sesion');
                }

                // Verificar el rol y redirigir correctamente
                if (usuario.rol === 'profesor') {
                    return res.redirect('/administracion');
                } else if (usuario.rol === 'alumno') {
                    return res.redirect('/panel-alumno');
                } else {
                    req.flash('error', 'Rol no asignado. Por favor selecciona un rol.');
                    return res.redirect('/rol-usuario');
                }
            } catch (error) {
                console.error('Error al autenticar usuario:', error);
                req.flash('error', 'Hubo un error al autenticar.');
                return res.redirect('/iniciar-sesion');
            }
        });
    })(req, res, next);
};

// Verificar si el usuario está autenticado
exports.usuarioAutenticado = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();  // El usuario está autenticado, proceder
    }
    return res.redirect('/iniciar-sesion');
};

// Cerrar sesión
exports.cerrarSesion = (req, res) => {
    req.logout(() => {
        req.flash('exito', 'Has cerrado sesión correctamente');
        res.redirect('/iniciar-sesion');
    });
};

// Middleware para asegurar que el usuario tenga un rol asignado
exports.seleccionarRolUsuario = async (req, res, next) => {
    try {
        const usuario = await Usuarios.findByPk(req.user.id);

        if (!usuario) {
            req.flash('error', 'Usuario no encontrado');
            return res.redirect('/iniciar-sesion');
        }

        // Verificar si el usuario tiene un rol asignado
        if (!usuario.rol) {
            req.flash('error', 'Por favor selecciona un rol.');
            return res.redirect('/rol-usuario');
        }

        return next();
    } catch (error) {
        console.error('Error al verificar rol del usuario:', error);
        req.flash('error', 'Hubo un error al verificar el rol.');
        return res.redirect('/iniciar-sesion');
    }
};
