// Objeto de ejemplo en JavaScript
const persona = {
  nombre: "María",
  edad: 30,
  ciudad: "Bogotá"
};

// Convertir objeto JS a JSON (string)
const personaJSON = JSON.stringify(persona);
console.log("Objeto convertido a JSON:", personaJSON);

// Convertir de JSON a objeto JS
const personaObjeto = JSON.parse(personaJSON);
console.log("JSON convertido a Objeto:", personaObjeto);

// Simulando usuarios (como si vinieran de usuarios.json)
const usuarios = [
  { id: 1, nombre: "Ana", email: "ana@email.com" },
  { id: 2, nombre: "Luis", email: "luis@email.com" },
  { id: 3, nombre: "Carlos", email: "carlos@email.com" }
];

// Imprimir lista de usuarios
usuarios.forEach(usuario => {
  console.log(`ID: ${usuario.id}, Nombre: ${usuario.nombre}, Email: ${usuario.email}`);
});

