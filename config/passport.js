const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const Usuarios = require('../models/Usuarios')
const emails = require('./emails')

passport.use(
  new localStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, next) => {
      try {
        // Buscar al usuario por su email
        const usuario = await Usuarios.findOne({ 
          where: { email, activo : 1 } })

        // Revisar si existe el usuario
        if (!usuario)
          return next(null, false, { message: 'Todavía no has confirmado tu cuenta' })

        // El usuario existe
        const verificarPass = usuario.validarPassword(password)

        // Si el password es incorrecto
        if (!verificarPass)
          return next(null, false, { message: 'El password es incorrecto' })

        // Usuario y password correctos
        return next(null, usuario)
      } catch (error) {
        return next(error)
      }
    }
  )
)

passport.serializeUser(function(usuario, cb) {
  cb(null, usuario)
})

passport.deserializeUser(function(usuario, cb) {
  cb(null, usuario)
})

module.exports = passport
