import axios from 'axios'
import Swal from 'sweetalert2'

document.addEventListener('DOMContentLoaded', () => {
	const formsEliminar = document.querySelectorAll('.eliminar-comentario')
	
	// Asegurarse de que los formularios de eliminación están siendo detectados
	if (formsEliminar.length > 0) {
		formsEliminar.forEach((form) => {
			form.addEventListener('submit', eliminarComentario);
		});
	}
})
function eliminarComentario(e) {
	e.preventDefault();

	Swal.fire({
		title: '¿Eliminar Comentario?',
		text: 'Un comentario eliminado no se puede recuperar',
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: 'Sí, borrar!',
		cancelButtonText: 'Cancelar'
	}).then((result) => {
		if (result.value) {
			// Tomar el id del comentario
			const comentarioId = this.querySelector('input[name="idComentario"]').value;

			// Crear el objeto de datos
			const datos = { 
				comentarioId 
			};

			// Ejecutar Axios y pasar los datos
			axios.post(this.action, datos).then((respuesta) => {
				// Mostrar SweetAlert de éxito
				Swal.fire('Eliminado', 'El comentario ha sido eliminado correctamente', 'success');
				 // Eliminar del DOM
          this.parentElement.parentElement.remove();
			})
			.catch(error => {
				if(error.response.status === 403 || error.response.status === 404) {
					Swal.fire('Error', error.response.data, 'error');
				}
      });
		}
	});	
}

