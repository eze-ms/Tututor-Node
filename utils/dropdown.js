document.addEventListener('DOMContentLoaded', () => {
    // Dropdown para Niveles
    const nivelesBtn = document.querySelector('.dropbtn.niveles'); 
    const nivelesDropdown = document.getElementById('nivelesDropdown');

    nivelesBtn.addEventListener('click', function () {
        nivelesDropdown.classList.toggle('show');
    });

    // Dropdown para Subcategorías
    const subcategoriasBtn = document.querySelector('.dropbtn.subcategorias'); 
    const subcategoriasDropdown = document.getElementById('subcategoriasDropdown');

    subcategoriasBtn.addEventListener('click', function () {
        subcategoriasDropdown.classList.toggle('show');
    });

    // Cerrar dropdowns cuando se hace clic fuera
    window.addEventListener('click', function (e) {
        if (!e.target.matches('.dropbtn.niveles') && !e.target.matches('.dropbtn.subcategorias')) {
            nivelesDropdown.classList.remove('show');
            subcategoriasDropdown.classList.remove('show');
        }
    });
});
