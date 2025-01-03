document.addEventListener('DOMContentLoaded', () => {
    // Dropdown para Niveles
    const nivelesBtn = document.querySelector('.dropbtn.niveles'); 
    const nivelesDropdown = document.getElementById('nivelesDropdown');

    if (nivelesBtn && nivelesDropdown) {
        nivelesBtn.addEventListener('click', function () {
            nivelesDropdown.classList.toggle('show');
        });
    }

    // Dropdown para Subcategorías
    const subcategoriasBtn = document.querySelector('.dropbtn.subcategorias'); 
    const subcategoriasDropdown = document.getElementById('subcategoriasDropdown');

    if (subcategoriasBtn && subcategoriasDropdown) {
        subcategoriasBtn.addEventListener('click', function () {
            subcategoriasDropdown.classList.toggle('show');
        });
    }

    // Cerrar dropdowns cuando se hace clic fuera
    window.addEventListener('click', function (e) {
        if (!e.target.matches('.dropbtn.niveles') && !e.target.matches('.dropbtn.subcategorias')) {
            if (nivelesDropdown) nivelesDropdown.classList.remove('show');
            if (subcategoriasDropdown) subcategoriasDropdown.classList.remove('show');
        }
    });
});
