const Comentarios = require('../../models/Comentarios');
const Clase = require('../../models/Clases');
const Usuarios = require('../../models/Usuarios'); 

exports.agregarComentario = async (req, res, next) => {
    const { comentario } = req.body

    await Comentarios.create({
        mensaje: comentario,
        usuarioId: req.user.id,
        claseId: req.params.id
    })

    res.redirect('back')
    next()
}

exports.eliminarComentario = async (req, res, next) => {
    try {
        // Tomar el ID del comentario
        const { comentarioId } = req.body

        // Consultar el comentario junto con la clase
        const comentario = await Comentarios.findOne({
            where: { id: comentarioId },
            include: {
                model: Clase,
                attributes: ['usuarioId'] // Solo necesitamos el usuarioId de la clase
            }
        })

        // Verificar si el comentario existe
        if (!comentario) {
            return res.status(404).json({ mensaje: 'Comentario no encontrado' })
        }

        // Verificar si quien intenta borrar es el autor del comentario o el creador de la clase
        if (comentario.usuarioId === req.user.id || comentario.Clase.usuarioId === req.user.id) {
            await Comentarios.destroy({ where: { id: comentarioId } })
            return res.status(200).json({ mensaje: 'Comentario eliminado correctamente' })
        } else {
            return res.status(403).json({ mensaje: 'No tienes permisos para eliminar este comentario' })
        }
    } catch (error) {
        console.error('Error al eliminar el comentario:', error)
        return res.status(500).json({ mensaje: 'Hubo un error al eliminar el comentario' })
    }
}
