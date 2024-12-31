import axios from "axios";

document.addEventListener('DOMContentLoaded', () => {
  const interes = document.querySelector('#confirmar-interes');
  if (interes) {
    interes.addEventListener('submit', confirmarAsistencia);
  }
});

function confirmarAsistencia(e) {
  e.preventDefault();

  const btn = document.querySelector('#confirmar-interes input[type="submit"]');
  let accion = document.querySelector('#accion').value;

  const datos = {
    accion
  }

  axios.post(this.action, datos)
    .then(respuesta => {
      if (accion === 'confirmar') {
        // Modifica los elementos del botón para cancelar
        document.querySelector('#accion').value = 'cancelar';
        btn.value = 'Cancelar';
        btn.classList.remove('btn-azul')
        btn.classList.add('btn-rosa')
      } else {
        // Modifica los elementos del botón para confirmar
        document.querySelector('#accion').value = 'confirmar';
        btn.value = 'Sí';
        btn.classList.remove('btn-rosa')
        btn.classList.add('btn-azul')
      }
    })
    .catch(error => {
      console.error('Error en la solicitud:', error);
    });
}
