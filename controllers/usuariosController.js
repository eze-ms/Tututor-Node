const { body, validationResult } = require('express-validator');
const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handler/emails');
const multer = require('multer');
const multerS3 = require('multer-s3');
const shortid = require('shortid');
const Clase = require('../models/Clases');
const homeController = require('./homeController');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');


// Configurar S3
const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

//! Mostrar el formulario de crear cuenta
exports.formCrearCuenta = async (req, res) => {
    req.query.mostrarCrearCuenta = true; // Activa el modal de crear cuenta
    await homeController.home(req, res); // Renderiza la home con el modal
};

//! Validaciones con express-validator
exports.validarNuevaCuenta = [
    body('email', 'Introduce un email válido').isEmail(),
    body('password', 'El password debe tener al menos 6 caracteres').isLength({ min: 6 }),
    body('confirmar', 'Confirmar no puede ir vacío').notEmpty(),
    body('confirmar').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('El password no coincide')
        }
        return true
    })
]

//! Controlador para crear una nueva cuenta
exports.crearNuevaCuenta = async (req, res) => {
    const usuario = req.body;

    delete usuario.rol;  // Este campo no debe enviarse durante la creación

    const erroresExpress = validationResult(req);
    let listaErrores = [];

    if (!erroresExpress.isEmpty()) {
        const erroresArray = erroresExpress.array().map(err => err.msg);
        listaErrores = [...erroresArray];
    }

    if (listaErrores.length > 0) {
        req.flash('error', listaErrores);
        req.query.mostrarCrearCuenta = true; // Reactiva el modal
        return homeController.home(req, res); // Renderiza la home con los errores
    }

    try {
        console.log('Datos recibidos para crear usuario:', usuario);

        await Usuarios.create(usuario);

        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;
        await enviarEmail.enviarEmail({
            usuario,
            url,
            subject: 'Confirma tu cuenta',
            archivo: 'confirmar-cuenta'
        });

        req.flash('exito', 'Hemos enviado un email, confirma tu cuenta');
        res.redirect('/iniciar-sesion');
    } catch (error) {
        console.error('Error al crear usuario:', error); // Log para depurar errores

        if (error.errors) {
            const erroresSequelize = error.errors.map(err => err.message);
            listaErrores = [...listaErrores, ...erroresSequelize];
        } else {
            listaErrores.push('Ocurrió un error inesperado al crear la cuenta.');
        }
        req.flash('error', listaErrores);
        req.query.mostrarCrearCuenta = true; // Reactiva el modal
        return homeController.home(req, res); // Renderiza la home con los errores
    }
};

exports.formIniciarSesion = async (req, res) => {
    req.query.mostrarModal = true; // Activa el modal
    await homeController.home(req, res); // Reutiliza la lógica de la home
};

//! Controlador para confirmar cuenta 
exports.confirmarCuenta = async (req, res) => {
    try {
        // Verificar que el usuario existe
        const usuario = await Usuarios.findOne({ where: { email: req.params.correo } });

        if (!usuario) {
            req.flash('error', 'No hemos encontrado una cuenta con ese correo.');
            return res.redirect('/crear-cuenta');
        }

        // Confirmar la cuenta
        usuario.activo = 1;
        await usuario.save();

        // Autenticar automáticamente después de la confirmación
        req.login(usuario, (err) => {
            if (err) {
                req.flash('error', 'Error iniciando sesión automáticamente.');
                return res.redirect('/iniciar-sesion');
            }

            // Redirigir a /rol-usuario si el usuario aún no ha seleccionado su rol
            if (!usuario.rol) {
                return res.redirect('/rol-usuario'); // <--- Redirigir aquí si no tiene rol
            }

            // Redirigir según el rol
            if (usuario.rol === 'profesor') {
                return res.redirect('/administracion');
            } else if (usuario.rol === 'alumno') {
                return res.redirect('/panel-alumno');
            }
        });
    } catch (error) {
        req.flash('error', 'Hubo un error al confirmar tu cuenta.');
        return res.redirect('/crear-cuenta');
    }
};

//! Controlador para mostrar la información para editar perfil
exports.formEditarPerfil = async (req, res) => {
    try {
        const usuario = await Usuarios.findByPk(req.user.id);

        if (!usuario) {
            req.flash('error', 'Usuario no encontrado');
            return res.redirect('/administracion');
        }

        res.render('editar-perfil', {
            nombrePagina: 'Editar perfil',
            usuario
        });
    } catch (error) {
        console.error('Error al cargar el perfil:', error);
        req.flash('error', 'Hubo un error al cargar el perfil');
        return res.redirect('/administracion');
    }
};

//! Controlador para manejar la edición del perfil y la subida de imágenes
exports.editarPerfil = async (req, res) => {
    try {
        console.log('DEBUG: Iniciando el proceso de edición de perfil.');

        // Buscar el usuario en la base de datos
        const usuario = await Usuarios.findByPk(req.user.id);
        if (!usuario) {
            console.error('ERROR: Usuario no encontrado en la base de datos.');
            req.flash('error', 'Usuario no encontrado');
            return res.redirect('/administracion');
        }
        console.log('DEBUG: Usuario encontrado:', usuario);

        // Validaciones del formulario
        const validaciones = [
            body('nombre').notEmpty().withMessage('El nombre es obligatorio.').trim().escape(),
            body('apellido').notEmpty().withMessage('El apellido es obligatorio.').trim(),
            body('fecha_nacimiento').notEmpty().withMessage('La fecha de nacimiento es obligatoria.').trim().escape(),
            body('email').isEmail().withMessage('Debes introducir un email válido.').trim().escape(),
            body('about').optional().trim(),
            body('tarifa').optional().trim().escape(),
            body('ubicacion').optional().trim().escape(),
            body('niveles').optional().trim().escape(), // Validar niveles seleccionados
        ];

        await Promise.all(validaciones.map((validation) => validation.run(req)));
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            const advertencias = errores.array().map((error) => `<li>${error.msg}</li>`);
            console.error('ERROR: Validaciones fallidas:', advertencias);

            return res.render('editar-perfil', {
                nombrePagina: 'Editar perfil',
                usuario,
                mensajes: { advertencia: `<ul>${advertencias.join('')}</ul>` },
            });
        }

        // Actualizar los campos del perfil
        const { nombre, apellido, fecha_nacimiento, email, about, tarifa, ubicacion, niveles } = req.body;

        // Convertir los niveles seleccionados en una cadena separada por comas
        usuario.niveles = niveles ? niveles.join(',') : null;
        console.log('DEBUG: Datos del usuario antes de asignar la imagen:', usuario);

        // Si hay una imagen nueva, guardar la URL pública de S3
        if (req.file) {
            console.log('DEBUG: Archivo recibido. URL de la imagen:', req.file.location);
            usuario.imagen = req.file.location; // URL pública de S3
            console.log('DEBUG: URL de la imagen asignada al usuario:', usuario.imagen);
        } else {
            console.log('DEBUG: No se recibió ninguna imagen nueva.');
        }

        // Asignar los datos al usuario
        usuario.nombre = nombre;
        usuario.apellido = apellido;
        usuario.fecha_nacimiento = fecha_nacimiento;
        usuario.email = email;
        usuario.about = about;
        usuario.tarifa = tarifa;
        usuario.ubicacion = ubicacion;

        console.log('DEBUG: Datos del usuario antes de guardar:', usuario);

        // Guardar cambios
        await usuario.save();
        console.log('DEBUG: Cambios guardados correctamente en la base de datos.');

        req.flash('exito', 'Perfil actualizado correctamente');
        return res.redirect('/administracion');
    } catch (error) {
        console.error('ERROR: Hubo un error al editar el perfil:', error);
        req.flash('error', 'Hubo un error al editar el perfil');
        return res.redirect('/editar-perfil');
    }
};

//! Configuración Multer
const configuracionMulter = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            const fileName = `uploads/usuarios/${shortid.generate()}.${extension}`;
            console.log('Subiendo archivo a S3 con el nombre:', fileName);
            cb(null, fileName); // Usar la ruta generada
        },
    }),
    limits: { fileSize: 1000000 }, // Limitar tamaño del archivo a 1MB
    fileFilter: (req, file, cb) => {
        const validExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']; 
        if (validExtensions.includes(file.mimetype)) {
            cb(null, true); // Permitir el archivo
        } else {
            req.flash('advertencia', 'Formato no válido. Solo se permiten imágenes JPEG, PNG o WEBP.');
            cb(new Error('Formato no válido'));
        }
    },
}).single('imagen');


//! Middleware para subir imágenes
exports.subirImagen = (req, res, next) => {
    configuracionMulter(req, res, function (error) {
        if (error) {
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('advertencia', 'El archivo es demasiado grande');
                }
            } else {
                req.flash('advertencia', error.message);
            }
            console.error('Error en Multer:', error); // Log para depurar errores de Multer
            return res.redirect('back'); 
        }
        console.log('Archivo recibido:', req.file); // Log para verificar el archivo recibido
        next();
    });
};

//! Controlador para editar una imagen de la clase
exports.formEditarImagen = async (req, res) => {
    try {
        const clase = await Clase.findOne({ 
            where: { 
                id: req.params.claseId, 
                usuarioId: req.user.id 
            } 
        })
        if (!clase) {
            req.flash('error', 'Clase no encontrada o no tienes permisos para editarla')
            return res.redirect('/administracion');
        }
        // Renderiza la vista para editar la imagen
        res.render('imagen-clase', {
            nombrePagina: `Editar imagen de la clase : ${clase.nombre}`,
            clase
        })        
    } catch (error) {
        req.flash('error', 'Hubo un error al cargar la imagen')
        res.redirect('/administracion')
    }
};

//! Controlador para modificar la imagen en la bbdd y eliminar la anterior
exports.editarImagen = async (req, res, next) => {
    try {
        // Verificar si la clase existe y pertenece al usuario
        const clase = await Clase.findOne({ where: { id: req.params.claseId, usuarioId: req.user.id } });

        // Si la clase no es válida o no existe
        if (!clase) {
            req.flash('aviso', 'Operación no válida');
            res.redirect('/iniciar-sesion');
            return next();
        }

        // Si hay una imagen anterior y nueva, eliminar la anterior de S3
        if (req.file && clase.imagen) {
            const bucket = process.env.AWS_S3_BUCKET_NAME;
            const key = clase.imagen.split(`${bucket}/`)[1]; // Obtener el nombre del archivo desde la URL

            try {
                await s3.send(new DeleteObjectCommand({
                    Bucket: bucket,
                    Key: key,
                }));
            } catch (error) {
                console.error('Error al eliminar la imagen anterior en S3:', error);
            }
        }

        // Asignar la nueva imagen si existe
        if (req.file) {
            console.log('URL de la imagen a guardar:', req.file.location);  // Log para depurar la URL
            clase.imagen = req.file.location; // URL pública de S3 para la clase
            await clase.save(); // Guardar en la base de datos
            console.log('URL de la imagen guardada en la base de datos:', clase.imagen); // Log para verificar la URL guardada
        }

        // Guardar los cambios en la BBDD
        await clase.save();
        req.flash('exito', '¡Cambios guardados correctamente!');
        res.redirect('/administracion');
    } catch (error) {
        console.error('Error al editar la imagen:', error);
        req.flash('error', 'Hubo un error al intentar modificar la imagen');
        res.redirect('/administracion');
    }
};

//! Controlador para mostrar el formulario para cambiar password
exports.formCambiarPassword = async (req, res) => {
    res.render('cambiar-password', {
        nombrePagina: 'Cambiar la contraseña'
    })
};

//! Controlador para revisar si el password anterior es correcto y cambiar a nuevo
exports.cambiarPassword = async (req, res, next) => {
    try {
        const usuario = await Usuarios.findByPk(req.user.id)

        // Verificar que el password anterior sea correcto
        if (!usuario.validarPassword(req.body.anterior)) {
            req.flash('advertencia', 'El password actual es incorrecto')
            res.redirect('/cambiar-password')
            return next()  // Continuar con el siguiente middleware o finalizar
        }

        // Si el password es correcto, hashear el nuevo
        const hash = usuario.hashPassword(req.body.nuevo)

        // Asignar el nuevo password al usuario
        usuario.password = hash

        // Guardar el nuevo password en la base de datos
        await usuario.save()

        // Establecer el mensaje de éxito antes de cerrar la sesión
        req.flash('exito', 'Contraseña cambiada correctamente! Vuelve a iniciar sesión')

        // Cerrar la sesión del usuario actual
        req.logout()

        // Redirigir al inicio de sesión
        res.redirect('/iniciar-sesion')
    } catch (error) {
        req.flash('error', 'Hubo un error al cambiar la contraseña. Inténtalo nuevamente.')
        res.redirect('/cambiar-password')
    }
};
