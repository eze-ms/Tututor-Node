document.addEventListener('DOMContentLoaded', function () {
    const carousel = document.querySelector('.list-items'); // Contenedor de la lista
    const prev = document.querySelector('.control.prev');   // Botón previo
    const next = document.querySelector('.control.next');   // Botón siguiente

    // Desplazar a la derecha
    next.addEventListener('click', function () {
        carousel.scrollBy({ left: 200, behavior: 'smooth' });  // Desplaza a la derecha
    });

    // Desplazar a la izquierda
    prev.addEventListener('click', function () {
        carousel.scrollBy({ left: -200, behavior: 'smooth' }); // Desplaza a la izquierda
    });
});
