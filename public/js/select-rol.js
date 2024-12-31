document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('rol-form');
    const rolInput = document.getElementById('rol-input');

    // Función que se llama al seleccionar el rol
    function seleccionarRol(rol) {
        rolInput.value = rol;  // Asigna el valor de "profesor" o "alumno"    
        form.submit();  // Envía el formulario automáticamente
    }
    window.seleccionarRol = seleccionarRol;  // Hacer la función globalmente accesible
});
