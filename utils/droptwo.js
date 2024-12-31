function toggleDropdown() {
    const dropdownContent = document.getElementById('dropdown-options');
    dropdownContent.style.display = dropdownContent.style.display === 'none' ? 'block' : 'none';
}

// Cerrar el dropdown al hacer clic fuera
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        const dropdowns = document.getElementsByClassName('dropdown-content');
        for (let i = 0; i < dropdowns.length; i++) {
            dropdowns[i].style.display = 'none';
        }
    }
}
