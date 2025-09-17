// =============================
// Ejercicio 1: Objeto a JSON
// =============================
const curso = {
  nombre: "JavaScript desde cero",
  duracion: "4 semanas",
  nivel: "Principiante"
};

const cursoJSON = JSON.stringify(curso);
console.log("Objeto convertido a JSON:");
console.log(cursoJSON);


// =============================
// Ejercicio 2: Parsear JSON
// =============================
const cursoParseado = JSON.parse(cursoJSON);
console.log(`Curso: ${cursoParseado.nombre} – Nivel: ${cursoParseado.nivel}`);


// =============================
// Ejercicio 3 (Desafío): usuarios.json
// =============================

// Simulación de archivo usuarios.json
const usuariosJSON = `
[
  { "id": 1, "nombre": "Ana", "email": "ana@mail.com" },
  { "id": 2, "nombre": "Luis", "email": "luis@mail.com" },
  { "id": 3, "nombre": "María", "email": "maria@mail.com" }
]
`;

const usuarios = JSON.parse(usuariosJSON);

console.log("=== Lista de Usuarios ===");
usuarios.forEach(usuario => {
  console.log(`Usuario ${usuario.id}: ${usuario.nombre} – ${usuario.email}`);
});
