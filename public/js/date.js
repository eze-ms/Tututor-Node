document.addEventListener('DOMContentLoaded', function() {
    const fechaNacimiento = document.getElementById('fecha_nacimiento');
    const error = document.getElementById('error');
    const hoy = new Date();

    // Convertir la fecha actual a formato YYYY-MM-DD
    const fechaHoy = hoy.toISOString().split('T')[0];
    
    // Establecer límites en el calendario
    fechaNacimiento.setAttribute('max', fechaHoy);  // No permite fechas futuras
    fechaNacimiento.setAttribute('min', '1900-01-01');  // Fecha mínima permitida

    // Validación al cambiar la fecha
    fechaNacimiento.addEventListener('input', function() {
        const fechaSeleccionada = new Date(fechaNacimiento.value);
        
        // Validar si la fecha es mayor a hoy
        if (fechaSeleccionada > hoy) {
            error.style.display = 'block';
            fechaNacimiento.value = '';  // Vaciar el campo si la fecha es inválida
        } else {
            error.style.display = 'none';
        }
    });
});
