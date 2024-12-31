document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('nav-links');

    // Añadir funcionalidad para mostrar/ocultar el menú
    hamburgerBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });
});

