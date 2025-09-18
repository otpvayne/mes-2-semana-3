// Ejemplo usando la API de Rick & Morty
// Endpoint: https://rickandmortyapi.com/api/character

fetch("https://rickandmortyapi.com/api/character")
  .then(response => response.json()) // Convertir a JSON
  .then(data => {
    console.log("=== Lista de personajes ===");
    console.log(data.results);

    // Desafío: mostrar el primer personaje
    const primerPersonaje = data.results[0];
    console.log(`Primer personaje: ${primerPersonaje.name}`);
    console.log(`Imagen: ${primerPersonaje.image}`);

    // Mostrar en pantalla (DOM)
    const div = document.createElement("div");
    div.innerHTML = `
      <h2>${primerPersonaje.name}</h2>
      <img src="${primerPersonaje.image}" alt="${primerPersonaje.name}" width="200">
    `;
    document.body.appendChild(div);
  })
  .catch(error => console.error("Error al obtener datos:", error));

