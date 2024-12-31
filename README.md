# TUTUTOR

## 📄 Descripción
Tututor es una plataforma en línea donde profesores ofrecen sus clases. Está construida utilizando **Node.js** con **Express** y emplea **Sequelize** para gestionar la base de datos **PostgreSQL**. 

### Características
1. **Autenticación de usuarios:**
   - Utiliza Passport.js para autenticar usuarios y gestionar sesiones.
   - Los usuarios pueden registrarse, iniciar sesión y seleccionar su rol (profesor o alumno).

2. **Gestión de clases:**
   - Los profesores pueden crear, editar y eliminar clases.
   - Los alumnos pueden buscar y filtrar clases por categorías y subcategorías.
   - Funcionalidad para agregar comentarios y mostrar interés en clases.

3. **Paneles diferenciados:**
   - Panel de administración para profesores (gestión de clases).
   - Panel para alumnos (ver clases en las que están interesados).

4. **Validación:**
   - Validación de datos en el servidor y cliente.

5. **Optimización:**
   - Optimización de rendimiento en consultas y carga de recursos.
   - Uso de Multer para subir imágenes con previsualización.

---

## 💻 Tecnologías Utilizadas
- **Node.js**
- **Express**
- **PostgreSQL**
- **Sequelize**
- **Passport.js**
- **Multer**

---

## 📊 Requisitos
- **Node.js:** Versión 16 o superior.
- **Base de datos PostgreSQL:** Configurada correctamente.
- Variables de entorno:
  - `DATABASE_URL`: Cadena de conexión a PostgreSQL.

---

## 🛠️ Instalación
1. Clona este repositorio:
   ```bash
   git clone https://github.com/eze-ms/Tututor-Node
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
---

## 🔧 Ejecución
1. Inicia el servidor en desarrollo:
   ```bash
   npm run dev
   ```
2. Accede a la aplicación en: `http://localhost:5000`.

---

## ✨ Características Adicionales
El sistema está diseñado para ser escalable:
- Gestión de notificaciones.
- Optimización para grandes volúmenes de datos.
- Funcionalidad futura para reportes y analíticas.

---

## 📢 Notas
- Revisa que el servidor PostgreSQL esté activo.
- Si tienes problemas:
  - Verifica las credenciales de conexión.
  - Consulta los logs de la aplicación.

---

© 2024. Proyecto desarrollado por **Ezequiel Macchi Seoane**.
