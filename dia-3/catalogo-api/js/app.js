'use strict';

/*
  app.js
  - fetch a Rick & Morty API
  - render cards desde data.results
  - búsqueda local por nombre
  - delegación para botones (Ver / Favorito)
  - "Cargar más" usando siguiente URL de la API
*/

// Config y selectores
const API_BASE = 'https://rickandmortyapi.com/api/character';
const catalogEl = document.getElementById('catalog');
const statusEl  = document.getElementById('status');
const searchEl  = document.getElementById('search');
const loadMoreBtn = document.getElementById('loadMore');
const template = document.getElementById('card-template');

// Estado local
let nextUrl = API_BASE; // URL siguiente a consultar (paging)
let items = [];         // array con personajes cargados

// Mostrar mensaje de estado (loading / error / info)
function setStatus(text, isError=false) {
  statusEl.textContent = text;
  statusEl.style.color = isError ? 'crimson' : '';
}

// Fetch con manejo de errores y parseo JSON
async function fetchAndAppend(url) {
  try {
    setStatus('Cargando personajes…');
    loadMoreBtn.disabled = true;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // data.info.next → url para la siguiente página (o null)
    nextUrl = data.info.next;
    items = items.concat(data.results); // añadir al estado

    render(items); // re-render con array actualizado

    // Si no hay más páginas, ocultar botón
    if (!nextUrl) {
      loadMoreBtn.style.display = 'none';
      setStatus('Todos los personajes cargados.');
    } else {
      loadMoreBtn.style.display = '';
      setStatus('');
      loadMoreBtn.disabled = false;
    }
  } catch (err) {
    console.error(err);
    setStatus('Error al cargar datos. Abre la consola para más info.', true);
    loadMoreBtn.disabled = false;
  }
}

// Renderiza un array de items (cards)
function render(list) {
  // Limpiar
  catalogEl.innerHTML = '';

  // Si no hay items, mostrar placeholder
  if (!list || list.length === 0) {
    catalogEl.innerHTML = '<p>No hay elementos para mostrar.</p>';
    return;
  }

  // Render usando template para evitar reconstruir strings crudos
  const frag = document.createDocumentFragment();
  for (const personaje of list) {
    // clonar el template
    const node = template.content.cloneNode(true);
    const article = node.querySelector('.card');
    const img = node.querySelector('.card__img');
    const title = node.querySelector('.card__title');
    const meta = node.querySelector('.card__meta');
    const verBtn = node.querySelector('.card-btn');
    const favBtn = node.querySelector('.fav-btn');

    // rellenar datos
    img.src = personaje.image;
    img.alt = `${personaje.name} - imagen`;
    title.textContent = personaje.name;
    meta.textContent = `${personaje.species} • ${personaje.status}`;

    // datos útiles en atributos data-*
    verBtn.dataset.id = personaje.id;
    favBtn.dataset.id = personaje.id;
    favBtn.setAttribute('aria-pressed', 'false'); // no favorito por defecto

    frag.appendChild(node);
  }

  catalogEl.appendChild(frag);
}

// Filtrado local por nombre (no hace nueva petición)
function filterByName(term) {
  const low = term.trim().toLowerCase();
  if (!low) return items; // sin término → todos
  return items.filter(p => p.name.toLowerCase().includes(low));
}

// Delegación: manejar clicks en botones dentro del catálogo
catalogEl.addEventListener('click', (e) => {
  const ver = e.target.closest('.card-btn');
  const fav = e.target.closest('.fav-btn');

  if (ver) {
    const id = ver.dataset.id;
    const p = items.find(x => String(x.id) === String(id));
    if (p) showDetailModal(p);
    return;
  }

  if (fav) {
    const id = fav.dataset.id;
    const pressed = fav.getAttribute('aria-pressed') === 'true';
    fav.setAttribute('aria-pressed', String(!pressed));
    // visual: cambiar texto o estado
    fav.textContent = !pressed ? '❤' : '❤';
    // opcional: guardar favoritos en localStorage
    toggleFavorite(id, !pressed);
    return;
  }
});

// Mostrar detalle simple (alert / modal). Aquí uso alert por simplicidad.
function showDetailModal(personaje) {
  // En un proyecto real abrirías un modal con más datos.
  alert(`${personaje.name}\nEspecie: ${personaje.species}\nEstado: ${personaje.status}`);
}

// Favoritos simple en localStorage (IDs)
function toggleFavorite(id, on) {
  const key = 'catalogo_favs_v1';
  const current = JSON.parse(localStorage.getItem(key) || '[]');
  const exists = current.includes(id);
  if (on && !exists) {
    current.push(id);
  } else if (!on && exists) {
    const idx = current.indexOf(id);
    current.splice(idx, 1);
  }
  localStorage.setItem(key, JSON.stringify(current));
}

// Búsqueda en UI
searchEl.addEventListener('input', (e) => {
  const filtered = filterByName(e.target.value);
  render(filtered);
});

// Cargar más button
loadMoreBtn.addEventListener('click', () => {
  if (nextUrl) fetchAndAppend(nextUrl);
});

// Inicio: primera petición
fetchAndAppend(nextUrl);

