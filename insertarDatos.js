const db = require('./config/db'); 
const Categoria = require('./models/Categorias');
const Clase = require('./models/Subcategorias');
const slugify = require('slugify');

const insertarDatos = async () => {
  try {
    
    await db.sync({ force: true }); // Esto reiniciará la base de datos, eliminará todas las tablas y las creará de nuevo.
    console.log('Base de datos sincronizada.');

    // Definir las categorías
    const categorias = [
      'Idiomas',
      'Música',
      'Académicas',
      'Artes',
      'Deportes',
      'Tecnología',
      'Preparación de Exámenes',
      'Hobbies',
      'Negocios'
    ];

    // Insertar categorías
    const categoriasMap = {};
    for (const categoriaNombre of categorias) {
      const categoria = await Categoria.create({ nombre: categoriaNombre });
      categoriasMap[categoriaNombre] = categoria.id;
    }

    // Definir las categorías y sus clases asociadas
    const categoriasConClases = {
    'Idiomas': ['Árabe', 'Alemán', 'Catalán', 'Chino', 'Español', 'Francés', 'Inglés', 'Italiano', 'Japonés', 'Portugués', 'Ruso'],
    'Música': ['Acordeón', 'Arpa', 'Bajo', 'Batería', 'Canto', 'Clarinete', 'Flauta', 'Guitarra', 'Oboe', 'Piano', 'Saxofón', 'Trompeta', 'Violín', 'Violonchelo'],
    'Académicas': ['Ciencias', 'Matemáticas', 'Física', 'Química', 'Biología', 'Historia'],
    'Artes': ['Dibujo', 'Pintura', 'Escultura', 'Fotografía', 'Teatro'],
    'Deportes': ['Musculación', 'Fitness','Entrenador personal', 'Crossfit', 'Pilates', 'Atletismo', 'Baloncesto', 'Béisbol', 'Esgrima', 'Fútbol', 'Gimnasia', 'Golf', 'Paddle', 'Natación', 'Rugby', 'Surf', 'Tenis', 'Voleibol', 'Yoga'],
    'Tecnología': ['Programación', 'Diseño Web', 'Ciberseguridad', 'Redes', 'AI'],
    'Preparación de Exámenes': ['SAT', 'GMAT', 'TOEFL', 'IELTS', 'ACT'],
    'Hobbies': ['Baile', 'Cocina', 'Costura', 'Jardinería', 'Ajedrez', 'Origami', 'Pintura', 'Escalada', 'Ciclismo', 'Carpintería', 'Escritura Creativa', 'Cerámica', 'Modelismo', 'Pesca', 'Bricolaje'],
    'Negocios': ['Marketing', 'Finanzas', 'Emprendimiento', 'Gestión de Proyectos', 'Liderazgo']
    };


    // Insertar clases asociadas a las categorías
    for (const [categoriaNombre, subcategorias] of Object.entries(categoriasConClases)) {
      const categoriaId = categoriasMap[categoriaNombre];
      for (const claseNombre of subcategorias) {
        const slug = slugify(claseNombre, { lower: true });
        await Clase.create({ nombre: claseNombre, categoriaId, slug });
      }
    }
  } catch (error) {
    console.error('Error al insertar los datos:', error.name, error.message, error.stack);
  } finally {
    await db.close(); // Asegura cerrar la conexión correctamente
  }
};

insertarDatos();
