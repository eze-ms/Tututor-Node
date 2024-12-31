document.addEventListener('DOMContentLoaded', function() {
    const selectCategoria = document.getElementById('categoria');

    // Verificar si el elemento 'categoria' está presente en la página
    if (selectCategoria) {
        selectCategoria.addEventListener('change', function() {
            var categoriaId = this.value; // Obtener el ID de la categoría seleccionada

            //! Solicitud al servidor para obtener las subcategorías asociadas a la categoría seleccionada
            fetch(`/api/subcategorias/${categoriaId}`)
                .then(response => response.json())
                .then(data => {
                    var subcategoriasSelect = document.getElementById('subcategorias');

                    // Limpiar el contenido del select de subcategorías y agregar la opción predeterminada
                    subcategoriasSelect.innerHTML = '<option value="" selected disabled>-- Elige una subcategoría --</option>';

                    // Agregar las subcategorías obtenidas como opciones en el select
                    data.forEach(subcategoria => {
                        var option = document.createElement('option');
                        option.value = subcategoria.id;
                        option.textContent = subcategoria.nombre;
                        subcategoriasSelect.appendChild(option);
                    });
                })
                .catch(error => console.error('Error al cargar las subcategorías:', error));
        });
    } else {
        console.log('El elemento con id "categoria" no se encuentra en el DOM.');
    }
});
