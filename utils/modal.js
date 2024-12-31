document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modal');
    const openModalLinks = document.querySelectorAll('#open-modal, #open-modal-footer');
    const closeModalLink = document.querySelector('.close-modal');

    //! Manejo del modal de éxito
    const modalExito = document.getElementById('modal-exito');

    if (modalExito) {
        modalExito.classList.add('active');

        const closeModalExito = modalExito.querySelector('.close-modal');
        closeModalExito.addEventListener('click', function(e) {
            e.preventDefault();
            modalExito.classList.remove('active');
        });

        modalExito.addEventListener('click', function(e) {
            if (e.target === modalExito) {
                modalExito.classList.remove('active');
            }
        });
    }

     //! Manejo del modal de advertencia
    const modalAdvertencia = document.getElementById('modal-advertencia');

    if (modalAdvertencia) {
        modalAdvertencia.classList.add('active');

        const closeModalAdvertencia = modalAdvertencia.querySelector('.close-modal');
        closeModalAdvertencia.addEventListener('click', function(e) {
            e.preventDefault();
            modalAdvertencia.classList.remove('active');
        });

        modalAdvertencia.addEventListener('click', function(e) {
            if (e.target === modalAdvertencia) {
                modalAdvertencia.classList.remove('active');
            }
        });
    }

    //! Manejo del modal de registro/inicio de sesión
    if (modal && openModalLinks.length > 0 && closeModalLink) {
        // Abrir el modal al hacer clic en los enlaces "Registrarse"
        openModalLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault(); // Evitar que se cargue la ruta /crear-cuenta
                modal.classList.add('active');
            });
        });

        // Cerrar el modal al hacer clic en la "X"
        closeModalLink.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.remove('active');
            window.location.href = '/'; // Redirige a la home
        });

        // Cerrar el modal al hacer clic fuera del modal
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
                window.location.href = '/'; // Redirige a la home
            }
        });
    }


    //! Manejo del modal de confirmación de eliminación
    const eliminarBtns = document.querySelectorAll('.btn.btn-azul2'); 
    const modalEliminar = document.getElementById('modal-eliminar');
    const formEliminar = document.getElementById('form-eliminar-clase');
    const nombreClase = document.getElementById('nombre-clase');

    if (modalEliminar) {
        eliminarBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const form = this.closest('form'); // Obtener el formulario más cercano
                const claseId = form.getAttribute('action').split('/eliminar-clase/')[1]; // Extraer el ID de la clase
                const claseNombre = this.closest('li').querySelector('h3').innerText;

                // Actualiza el texto del modal con el nombre de la clase
                nombreClase.textContent = claseNombre;

                // Actualiza la acción del formulario para incluir el ID de la clase
                formEliminar.setAttribute('action', `/eliminar-clase/${claseId}`);

                // Mostrar el modal de confirmación
                modalEliminar.classList.add('active');
            });
        });

        // Cerrar el modal de confirmación de eliminación
        const closeModalEliminar = modalEliminar.querySelector('.close-modal');
        closeModalEliminar.addEventListener('click', function(e) {
            e.preventDefault();
            modalEliminar.classList.remove('active');
        });

        modalEliminar.addEventListener('click', function(e) {
            if (e.target === modalEliminar) {
                modalEliminar.classList.remove('active');
            }
        });
    }

});
