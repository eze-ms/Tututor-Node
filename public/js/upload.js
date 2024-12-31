document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('cv');
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');
    const fileNameSpan = document.getElementById('file-name');
    const avatarPreview = document.getElementById('avatarPreview'); // Imagen de previsualización

    // Verificar si el input de archivo existe antes de agregar el event listener
    if (fileInput) {
        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];

            if (file) {
                // Mostrar el nombre del archivo seleccionado
                fileNameSpan.textContent = file.name;

                // Mostrar la barra de progreso
                progressContainer.style.display = 'block';

                // Simular el progreso de la subida de archivos
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 10;
                    progressBar.style.width = progress + '%';
                    progressBar.textContent = progress + '%';

                    if (progress >= 100) {
                        clearInterval(interval);
                    }
                }, 100);

                // Crear una vista previa de la imagen seleccionada
                const reader = new FileReader();
                reader.onload = function(e) {
                    avatarPreview.src = e.target.result;
                };
                reader.readAsDataURL(file); // Leer el archivo seleccionado como DataURL
            }
        });
    }
});
