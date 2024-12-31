document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('fecha_nacimiento');
    
    if (dateInput) {
        const minDate = '1900-01-01';  // O cualquier valor que quieras establecer como mínimo
        const maxDate = new Date().toISOString().split('T')[0];  // Fecha actual en formato 'yyyy-MM-dd'

        dateInput.setAttribute('min', minDate);
        dateInput.setAttribute('max', maxDate);
    } else {
        console.log('No se encontró el input de fecha.');
    }
});
