// --------------------------------------
//! 1. Configuración de Entorno y Módulos Requeridos
// --------------------------------------

require('dotenv').config({ path: './variables.env' }) // Configuración de variables de entorno

const express = require('express')
const path = require('path')
const expressEjsLayouts = require('express-ejs-layouts')
const flash = require('connect-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const passport = require('./config/passport')

// --------------------------------------
//! 2. Configuración y Modelos de la Base de Datos
// --------------------------------------

const db = require('./config/db');

// Importar todos los modelos
require('./models/Usuarios');
require('./models/Categorias');
require('./models/Clases');
require('./models/Comentarios');
require('./models/Subcategorias');
require('./models/ClaseSubcategoria');
require('./models/associations');


// Conexión a la Base de Datos y sincronización
db.sync({ alter: true })
    .then(() => console.log('DB Conectada correctamente'))
    .catch((error) => console.log('Error al conectar con la DB:', error));

// --------------------------------------
//! 3. Configuración de la Aplicación Express
// --------------------------------------

const app = express()

// Lectura de datos enviados en formularios
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Configuración del motor de plantillas EJS
app.use(expressEjsLayouts)
app.set('view engine', 'ejs')

// Ubicación de las vistas
app.set('views', path.join(__dirname, './views'))

// Archivos estáticos
app.use(express.static('public'))
app.use('/utils', express.static(path.join(__dirname, 'utils')))

// --------------------------------------
//! 4. Configuración de Middleware
// --------------------------------------

// Habilitar cookie parser
app.use(cookieParser())

// Configuración de la sesión
app.use(session({
  secret: process.env.SECRETO,
  key: process.env.KEY,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}))
// Añadir esto para depurar
app.use((req, res, next) => {
  next();
});

// Inicializar passport
app.use(passport.initialize())
app.use(passport.session())

// Añadir esto para depurar
app.use((req, res, next) => {
  next();
});

// Agregar flash messages
app.use(flash())

// Middleware global para la fecha actual
app.use((req, res, next) => {
  res.locals.usuario = req.user ? {...req.user} : null  
  res.locals.mensajes = req.flash()
  const fecha = new Date()
  res.locals.year = fecha.getFullYear()
  next()
})


// --------------------------------------
//! 5. Rutas de la Aplicación
// --------------------------------------
const router = require('./routes'); // Importar el archivo de rutas
app.use('/', router()); // Asegúrate de que router() esté correctamente llamado

const clasesApi = require('./routes/api/subcategorias'); 
app.use('/api', clasesApi); 

// Ruta base para pruebas
app.get('/', (req, res) => {
  res.send('¡Servidor funcionando correctamente!');
});

// --------------------------------------
//! 6. Inicialización del Servidor
// --------------------------------------

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`El servidor está funcionando en el puerto ${PORT}...`)
})
