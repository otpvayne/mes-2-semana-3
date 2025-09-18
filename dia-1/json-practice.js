// Importamos 'fs' para leer archivos en Node.js
const fs = require("fs");

// ---------------------
// Ejercicio 1: Objeto -> JSON
// ---------------------
const curso = {
  nombre: "JavaScript Básico",
  duracion: "4 semanas",
  nivel: "Principiante"
};

const cursoJSON = JSON.stringify(curso);
console.log("=== Ejercicio 1: Objeto a JSON ===");
console.log(cursoJSON);

// ---------------------
// Ejercicio 2: JSON -> Objeto
// ---------------------
const cursoParseado = JSON.parse(cursoJSON);
console.log("\n=== Ejercicio 2: JSON a Objeto ===");
console.log(`Curso: ${cursoParseado.nombre} – Nivel: ${cursoParseado.nivel}`);

// ---------------------
// Ejercicio 3: Leer usuarios.json
// ---------------------
console.log("\n=== Ejercicio 3: Lista de Usuarios ===");

const data = fs.readFileSync("usuarios.json", "utf-8");
const usuarios = JSON.parse(data);

usuarios.forEach(usuario => {
  console.log(`Usuario ${usuario.id}: ${usuario.nombre} – ${usuario.email}`);
});
