const db = require('../config/db');
const Sequelize = require('sequelize'); // Importar Sequelize
const ClaseSubcategoria = require('../models/ClaseSubcategoria');  // Importar la tabla intermedia
const Categoria = require('../models/Categorias');
const Subcategoria = require('../models/Subcategorias');
const Clase = require('../models/Clases');
const Usuarios = require('../models/Usuarios'); // Importar el modelo Usuario
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');


//! Configuración de Multer para Subida de Imágenes
const configuracionMulter = {
    storage: multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname + '/../public/uploads/grupos')
        },
        filename: (req, file, next) => {
            const extension = file.mimetype.split('/')[1]
            next(null, `${shortid.generate()}.${extension}`) // Genera un nombre único para cada archivo
        }
    }),
    limits: { fileSize: 1000000 }, // Opcional: Limita el tamaño del archivo, por ejemplo, 1MB
    fileFilter: (req, file, next) => {
        const validExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']; // Solo imágenes JPEG y PNG

        if (validExtensions.includes(file.mimetype)) {
            next(null, true); // Permitir el archivo
        } else {
            // Bloquear archivo no permitido con mensaje de advertencia
            req.flash('advertencia', 'Formato no válido. Solo se permiten imágenes JPEG, PNG o WEBP.');
            return next(null, false); // Rechazar el archivo
        }
    }
}
const upload = multer(configuracionMulter).single('imagen')

//! Middleware para subir imágenes
exports.subirImagen = (req, res, next) => {
    upload(req, res, function (error) {
        if (error) {
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('advertencia', 'El archivo es demasiado grande'); // Mensaje si el archivo es demasiado grande
                }
            } else {
                req.flash('advertencia', error.message); // Otro tipo de error de multer
            }
            // Redirigir a la misma página con el mensaje de advertencia
            return res.redirect('back'); 
        }
        next(); // Si no hay errores, continuar al siguiente middleware
    })
}

//! Controlador para Mostrar el Formulario de Crear Clase
exports.formNuevaClase = async (req, res) => {
    let step = parseInt(req.query.step) || 1; // Control de pasos
    const claseData = req.session.claseData || {}; // Recupera los datos almacenados temporalmente

    // Si no hay `step`, redirigir a `step=1`
    if (!req.query.step) {
        return res.redirect('/nueva-clase?step=1');
    }

    try {
        const categorias = await Categoria.findAll(); // Obtener las categorías para los pasos relevantes

        let nombrePagina;
        let subcategorias = [];

        switch (step) {
            case 1:
                nombrePagina = "Pon un título a la clase";
                break;
            case 2:
                nombrePagina = "Descripción de la clase";
                break;
            case 3:
                nombrePagina = "Elige una categoría y subcategoría";
                if (claseData.categoriaId) {
                    subcategorias = await Subcategoria.findAll({
                        where: { categoriaId: claseData.categoriaId }
                    });
                }
                break;
            case 4:
                nombrePagina = "Ubicación";
                break;
            case 5:
                nombrePagina = "Selecciona la Modalidad";
                break;
            case 6:
                nombrePagina = "Imagen para la clase";
                break;
            default:
                return res.redirect('/nueva-clase?step=1');
        }

        res.render('nueva-clase', {
            nombrePagina,
            categorias,
            subcategorias,
            step,
            claseData // Pasa los datos acumulados a la vista
        });
    } catch (error) {
        console.error('Error al cargar la página de nueva clase:', error);
        res.status(500).send('Error al cargar la página de nueva clase');
    }
};

//! Controlador para crear la clase con validación, sanitización y almacenamiento en la BBDD
exports.crearClase = async (req, res) => {
    const step = parseInt(req.query.step) || 1;
    const claseData = req.session.claseData || {};

    // Función para eliminar etiquetas HTML
    const stripTags = (html) => {
        return html.replace(/<\/?[^>]+(>|$)/g, "");
    };

    let validaciones = [];

    if (step === 1) {
        validaciones.push(
            body('nombre')
                .notEmpty().withMessage('El nombre de la clase es obligatorio.')
                .trim().escape()
        );
    } else if (step === 2) {
        validaciones.push(
            body('descripcion')
                .notEmpty().withMessage('La descripción es obligatoria.')
                .trim()
        );
    } else if (step === 3) {
        validaciones.push(
            body('categoriaId')
                .notEmpty().withMessage('Debes seleccionar una categoría.')
                .isInt({ min: 1 }).withMessage('La categoría seleccionada no es válida.')
                .trim().escape(),
            body('subcategoriasId')
                .optional()
                .isArray().withMessage('Debes seleccionar al menos una subcategoría.')
                .custom((value) => {
                    return value.every(id => parseInt(id) > 0);
                }).withMessage('La subcategoría seleccionada no es válida.')
        );
    } else if (step === 4) {
        validaciones.push(
            body('ubicacion')
                .notEmpty().withMessage('La ubicación es obligatoria.')
                .trim().escape()
        );
    } else if (step === 5) { // Nueva validación para el paso de modalidad
        validaciones.push(
            body('modalidad')
                .notEmpty().withMessage('Debes seleccionar una modalidad.')
                .isIn(['Presencial', 'Online', 'Presencial/Online']).withMessage('La modalidad seleccionada no es válida.')
        );
    }

    await Promise.all(validaciones.map(validation => validation.run(req)));
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        const mensajesAdvertencia = errores.array().map(error => error.msg);

        return res.render('nueva-clase', {
            nombrePagina: "Crear nueva clase",
            categorias: await Categoria.findAll(),
            subcategorias: await Subcategoria.findAll({ where: { categoriaId: claseData.categoriaId } }),
            step,
            mensajes: { advertencia: `<ul>${mensajesAdvertencia.join('')}</ul>` },
            claseData
        });
    }

    // Almacenar los datos en la sesión
    Object.assign(claseData, req.body);
    req.session.claseData = claseData;

    if (step === 6) { // Cambiado a step 6 ya que es el último paso antes de guardar
        try {
            const { nombre, descripcion, categoriaId, subcategoriasId, ubicacion, modalidad } = claseData;

            // Generar el slug a partir del nombre
            const slug = slugify(nombre, { lower: true });

            let imagen = null;
            if (req.file) {
                imagen = req.file.filename;
            }

            const descripcionLimpia = stripTags(descripcion);

            // Crear la clase
            const clase = await Clase.create({
                nombre,
                slug,
                descripcion: descripcionLimpia,
                categoriaId,
                ubicacion,
                modalidad, // Incluir modalidad en la creación de la clase
                imagen,
                usuarioId: req.user.id
            });

            // Insertar manualmente las relaciones en la tabla intermedia
            if (subcategoriasId && subcategoriasId.length > 0) {
                const relaciones = subcategoriasId.map(subcategoriaId => ({
                    claseId: clase.id,
                    subcategoriaId
                }));
                await db.models.ClaseSubcategoria.bulkCreate(relaciones); // Insertar las relaciones en la tabla intermedia
            }

            req.flash('exito', 'Clase creada correctamente');
            return res.redirect('/administracion');
        } catch (error) {
            console.error('Error al crear la clase:', error);
            req.flash('error', 'Hubo un error al crear la clase');
            return res.redirect('/nueva-clase?step=6');
        }
    }

    return res.redirect(`/nueva-clase?step=${step + 1}`);
};

//! Controlador para editar clases
exports.formEditarClase = async (req, res) => {
  try {
    const consultas = [];
    consultas.push(Clase.findByPk(req.params.claseId, {
      include: {
        model: Subcategoria, // Incluir subcategorias asociadas a la clase
        as: 'subcategorias',  // Alias correcto 'subcategorias'
        attributes: ['id', 'nombre']
      }
    }))
    consultas.push(Categoria.findAll()); // Obtener todas las categorías

    const [clase, categorias] = await Promise.all(consultas)

    if (!clase) {
      req.flash('error', 'Clase no encontrada')
      return res.redirect('/administracion')
    }

    // Obtener todas las subcategorías de la categoría de la clase
    const subcategorias = await Subcategoria.findAll({
      where: { categoriaId: clase.categoriaId }
    })

    // Mapear las subcategorías seleccionadas de la clase
    const subcategoriasSeleccionadas = clase.subcategorias.map(sub => sub.id)

    // Pasar la variable `subcategorias` a la vista
    res.render('editar-clase', {
      nombrePagina: `Editar clase: ${clase.nombre}`,
      clase,
      categorias,
      subcategorias,  // Pasar subcategorias a la vista
      subcategoriasSeleccionadas: clase.subcategorias.map(sub => sub.id),
      ubicacion: clase.ubicacion || ''
    })
  } catch (error) {
    console.error('Error al cargar la clase para edición:', error)
    req.flash('error', 'Hubo un error al cargar la clase para edición')
    res.redirect('/administracion')
  }
}

//! Controlador para guardar los cambios en la BBDD
exports.editarClase = async (req, res) => {
    try {
        const clase = await Clase.findOne({ 
            where: { id: req.params.claseId, usuarioId: req.user.id },
            include: {
                model: Subcategoria, // Incluir subcategorias asociadas a la clase
                as: 'subcategorias'  // Usar el alias correcto definido en el modelo
            }
        })

        if (!clase) {
            req.flash('advertencia', 'Operación no válida');
            return res.redirect('/administracion');
        }

        const { nombre, descripcion, categoriaId, ubicacion, subcategoriasId } = req.body;

        // Asignar valores
        clase.nombre = nombre;
        clase.descripcion = descripcion;
        clase.categoriaId = categoriaId;
        clase.ubicacion = ubicacion;

        // Actualizar subcategorías 
        await clase.setSubcategorias(subcategoriasId || [])  // Si no se selecciona ninguna, pasamos un array vacío

        // Guardar cambios en la base de datos
        await clase.save()

        // Mensaje de éxito y redirección
        req.flash('exito', 'Cambios guardados correctamente')
        return res.redirect('/administracion')
    } catch (error) {
        req.flash('error', 'Hubo un error al guardar los cambios')
        return res.redirect(`/editar-clase/${req.params.claseId}`)
    }
}

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
        req.flash('error', 'Hubo un error al cargar la clase')
        res.redirect('/administracion')
    }
}

//! Controlador para modificar la imagen en la bbdd y eliminar la anterior
exports.editarImagen = async (req, res, next) => {
    try {
        // Verificar si la clase existe y pertenece al usuario
        const clase = await Clase.findOne({ where: { id: req.params.claseId, usuarioId: req.user.id } })

        // Si la clase no es válida o no existe
        if (!clase) {
            req.flash('aviso', 'Operación no válida')
            res.redirect('/iniciar-sesion')
            return next()
        }
        
         // Si hay una imagen anterior y nueva, eliminar la anterior
        if (req.file && clase.imagen) {
            const imagenAnteriorPath = path.join(__dirname, `../public/uploads/grupos/${clase.imagen}`);

            //* Eliminar la imagen anterior de manera asíncrona usando Promesas
            fs.promises.unlink(imagenAnteriorPath)
                .catch((error) => {
                    console.error('Error al eliminar la imagen anterior:', error);
                });
        }

        // Asignar la nueva imagen si existe
        if (req.file) {
            clase.imagen = req.file.filename
        }

        // Guardar los cambios en la BBDD
        await clase.save();
        req.flash('exito', '¡Cambios guardados correctamente!')
        res.redirect('/administracion')

    } catch (error) {
        console.error('Error al editar la imagen:', error);
        req.flash('error', 'Hubo un error al intentar modificar la imagen');
        res.redirect('/administracion');
    }
}

//! Controlador para eliminar la clase o el interés del alumno
exports.eliminarClase = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const claseId = req.params.claseId;

        // Verificar si la clase existe y pertenece al profesor o si el alumno mostró interés
        const clase = await Clase.findOne({
            where: {
                id: claseId,
                [Sequelize.Op.or]: [
                    { usuarioId: usuarioId }, // El profesor es el dueño de la clase
                    { interesados: { [Sequelize.Op.contains]: [usuarioId] } } // El alumno está interesado en la clase
                ]
            },
            include: [{ model: Usuarios, as: 'usuario' }] // Incluyendo el usuario relacionado con la clase
        });

        if (!clase) {
            req.flash('error', 'Operación no válida');
            return res.redirect(req.user.rol === 'profesor' ? '/administracion' : '/panel-alumno');
        }

        // Si el profesor es el dueño de la clase, eliminarla completamente
        if (clase.usuarioId === usuarioId) {
            // Eliminar las relaciones en la tabla intermedia
            await ClaseSubcategoria.destroy({ where: { claseId: clase.id } });

            // Si la clase tiene una imagen, eliminarla del servidor
            if (clase.imagen) {
                const imagenPath = path.join(__dirname, `../public/uploads/grupos/${clase.imagen}`);
                await fs.promises.unlink(imagenPath).catch(error => console.error('Error al eliminar la imagen:', error));
            }

            // Eliminar la clase
            await clase.destroy();
            req.flash('exito', 'Clase eliminada correctamente');
        } else {
            // Si es un alumno que mostró interés, solo eliminar su interés
            await Clase.update(
                { interesados: Sequelize.fn('array_remove', Sequelize.col('interesados'), usuarioId) },
                { where: { id: claseId } }
            );
            req.flash('exito', 'Has cancelado tu interés en esta clase');
        }

        // Redirigir al panel correspondiente, según el rol del usuario
        res.redirect(req.user.rol === 'profesor' ? '/administracion' : '/panel-alumno');

    } catch (error) {
        console.error('Error al eliminar la clase:', error);
        req.flash('error', 'Hubo un error al eliminar la clase');
        res.redirect(req.user.rol === 'profesor' ? '/administracion' : '/panel-alumno');
    }
};
