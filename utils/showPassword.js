document.getElementById('togglePassword').addEventListener('change', function() {
    const anterior = document.getElementById('anterior');
    const nuevo = document.getElementById('nuevo');

    if (this.checked) {
        anterior.type = 'text';
        nuevo.type = 'text';
    } else {
        anterior.type = 'password';
        nuevo.type = 'password';
    }
});