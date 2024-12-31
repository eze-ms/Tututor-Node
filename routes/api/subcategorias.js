const express = require('express')
const router = express.Router()
const Subcategorias = require('../../models/Subcategorias')

//! Endpoint para obtener subcategorías por categoría
router.get('/subcategorias/:categoriaId', async (req, res) => {
    try {
       
        //? Buscar todas las subcategorías que pertenecen a la categoría con el ID proporcionado
        const subcategorias = await Subcategorias.findAll({
            where: { categoriaId: req.params.categoriaId }
        })

        //? Enviar las subcategorías encontradas en formato JSON como respuesta
        res.json(subcategorias)
    } catch (error) {
        // Imprimir cualquier error que ocurra durante la búsqueda de subcategorías
        console.error('Error al obtener las subcategorías:', error)

        // Enviar un estado 500 y un mensaje de error si ocurre un problema
        res.status(500).send('Error al obtener las subcategorías')
    }
})

module.exports = router;
