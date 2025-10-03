'use strict';

/*
  app.js (mejorado con retos)
  - fetch a Rick & Morty API
  - render cards desde data.results
  - búsqueda local por nombre
  - delegación para botones (Ver / Favorito)
  - "Cargar más" usando siguiente URL de la API
  - RETOS añadidos:
    * Paginación Prev / Next
    * Modal accesible en lugar de alert()
    * Favoritos persistentes (localStorage)
    * Skeleton placeholders mientras se carga
*/

// Config y selectores
const API_BASE = 'https://rickandmortyapi.com/api/character';
const catalogEl = document.getElementById('catalog');
const statusEl  = document.getElementById('status');
const searchEl  = document.getElementById('search');
const loadMoreBtn = document.getElementById('loadMore');
const template = document.getElementById('card-template');

// Creamos contenedor de controles si existe (.controls), para añadir Prev/Next
const controlsEl = document.querySelector('.controls') || document.body;

// Estado local
let nextUrl = API_BASE; // URL siguiente a consultar (paging)
let prevUrl = null;     // URL previa
let items = [];         // array con personajes cargados

// KEY para favoritos en localStorage
const FAV_KEY = 'catalogo_favs_v1';

// ---------- UI Dinámico: crear botones Prev / Next ----------
const prevBtn = document.createElement('button');
prevBtn.id = 'prevBtn';
prevBtn.className = 'btn';
prevBtn.textContent = 'Prev';
prevBtn.style.display = 'none'; // oculto hasta que haya prev
prevBtn.disabled = true;

const nextBtn = document.createElement('button');
nextBtn.id = 'nextBtn';
nextBtn.className = 'btn';
nextBtn.textContent = 'Next';
nextBtn.style.display = 'none';
nextBtn.disabled = true;

// Insertar prev/next antes (o cerca) del botón loadMore si existe
if (loadMoreBtn && controlsEl.contains(loadMoreBtn)) {
  controlsEl.insertBefore(prevBtn, loadMoreBtn);
  controlsEl.insertBefore(nextBtn, loadMoreBtn.nextSibling);
} else {
  // si no existe controls, agregamos al body
  controlsEl.appendChild(prevBtn);
  controlsEl.appendChild(nextBtn);
}

// ---------- Modal accesible (creado dinámicamente) ----------
const modal = document.createElement('div');
modal.className = 'rm-modal';
modal.setAttribute('role', 'dialog');
modal.setAttribute('aria-hidden', 'true');
modal.setAttribute('aria-modal', 'true');
modal.innerHTML = `
  <div class="rm-modal__overlay" tabindex="-1"></div>
  <div class="rm-modal__content" role="document">
    <button class="rm-modal__close" aria-label="Cerrar diálogo">×</button>
    <div class="rm-modal__body"></div>
  </div>
`;
document.body.appendChild(modal);

const modalOverlay = modal.querySelector('.rm-modal__overlay');
const modalClose = modal.querySelector('.rm-modal__close');
const modalBody = modal.querySelector('.rm-modal__body');

let lastFocusedElement = null;

function openModal(personaje) {
  lastFocusedElement = document.activeElement;
  modalBody.innerHTML = `
    <h2>${personaje.name}</h2>
    <img src="${personaje.image}" alt="${personaje.name}" style="max-width:240px;display:block;margin:0.5rem 0;">
    <p><strong>Especie:</strong> ${personaje.species}</p>
    <p><strong>Estado:</strong> ${personaje.status}</p>
    <p><strong>Género:</strong> ${personaje.gender}</p>
    <p><strong>Origen:</strong> ${personaje.origin?.name || '—'}</p>
  `;
  modal.setAttribute('aria-hidden', 'false');
  modal.style.display = 'flex';
  modalClose.focus();

  // ESC para cerrar
  window.addEventListener('keydown', handleKeyDownModal);
}

function closeModal() {
  modal.setAttribute('aria-hidden', 'true');
  modal.style.display = 'none';
  modalBody.innerHTML = '';
  window.removeEventListener('keydown', handleKeyDownModal);
  if (lastFocusedElement) lastFocusedElement.focus();
}
function handleKeyDownModal(e) {
  if (e.key === 'Escape') closeModal();
}

// cerrar por overlay o boton
modalOverlay.addEventListener('click', closeModal);
modalClose.addEventListener('click', closeModal);

// ---------- Helpers: status / skeleton ----------
function setStatus(text, isError=false) {
  statusEl.textContent = text || '';
  statusEl.style.color = isError ? 'crimson' : '';
}

function showSkeleton(count = 6) {
  catalogEl.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'card skeleton';
    s.style.minHeight = '260px';
    s.style.display = 'flex';
    s.style.flexDirection = 'column';
    s.style.justifyContent = 'flex-start';
    s.style.padding = '0.4rem';
    s.innerHTML = `
      <div style="width:100%;height:160px;background:#e6edf3;border-radius:8px"></div>
      <div style="height:12px;width:60%;background:#e6edf3;border-radius:8px;margin-top:10px"></div>
      <div style="height:12px;width:40%;background:#e6edf3;border-radius:8px;margin-top:8px"></div>
    `;
    frag.appendChild(s);
  }
  catalogEl.appendChild(frag);
}

// ---------- Favorites helpers ----------
function getFavorites() {
  try {
    const raw = JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
    // asegurar números
    return raw.map(id => Number(id));
  } catch {
    return [];
  }
}
function toggleFavorite(id, on) {
  const key = FAV_KEY;
  const current = getFavorites();
  const nId = Number(id);
  const exists = current.includes(nId);
  if (on && !exists) {
    current.push(nId);
  } else if (!on && exists) {
    const idx = current.indexOf(nId);
    current.splice(idx, 1);
  }
  localStorage.setItem(key, JSON.stringify(current));
}

// ---------- Fetch con manejo de errores y parseo JSON ----------
async function fetchAndAppend(url) {
  try {
    setStatus('Cargando personajes…');
    // mostrar skeleton mientras carga
    showSkeleton(6);
    // deshabilitar botones
    loadMoreBtn.disabled = true;
    prevBtn.disabled = true;
    nextBtn.disabled = true;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // paging
    nextUrl = data.info.next;
    prevUrl = data.info.prev;

    // concatenar resultados (estado acumulado)
    items = items.concat(data.results);

    render(items); // re-render con array actualizado

    // Mostrar/ocultar botones de paginación
    prevBtn.style.display = prevUrl ? '' : 'none';
    nextBtn.style.display = nextUrl ? '' : 'none';
    prevBtn.disabled = !prevUrl;
    nextBtn.disabled = !nextUrl;
    // Además controlamos el botón loadMore (mantener compatibilidad)
    loadMoreBtn.style.display = nextUrl ? '' : 'none';

    // limpiar status
    setStatus('');
    loadMoreBtn.disabled = false;
  } catch (err) {
    console.error(err);
    setStatus('Error al cargar datos. Abre la consola para más info.', true);
    loadMoreBtn.disabled = false;
    prevBtn.disabled = false;
    nextBtn.disabled = false;
  }
}

// ---------- Render basado en template, ahora respetando favoritos ----------
function render(list) {
  catalogEl.innerHTML = '';

  if (!list || list.length === 0) {
    catalogEl.innerHTML = '<p>No hay elementos para mostrar.</p>';
    return;
  }

  const favs = getFavorites();
  const frag = document.createDocumentFragment();
  for (const personaje of list) {
    const node = template.content.cloneNode(true);
    const img = node.querySelector('.card__img');
    const title = node.querySelector('.card__title');
    const meta = node.querySelector('.card__meta');
    const verBtn = node.querySelector('.card-btn');
    const favBtn = node.querySelector('.fav-btn');

    img.src = personaje.image;
    img.alt = `${personaje.name} - imagen`;
    title.textContent = personaje.name;
    meta.textContent = `${personaje.species} • ${personaje.status}`;

    verBtn.dataset.id = personaje.id;
    favBtn.dataset.id = personaje.id;

    // Si está en favoritos, marcarlo (persistente)
    const isFav = favs.includes(Number(personaje.id));
    favBtn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
    favBtn.textContent = isFav ? '❤' : '❤'; // puedes cambiar icono si quieres

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

// ---------- Delegación: manejar clicks en botones dentro del catálogo ----------
catalogEl.addEventListener('click', (e) => {
  const ver = e.target.closest('.card-btn');
  const fav = e.target.closest('.fav-btn');

  if (ver) {
    const id = ver.dataset.id;
    const p = items.find(x => String(x.id) === String(id));
    if (p) openModal(p); // ahora abrimos modal accesible
    return;
  }

  if (fav) {
    const id = fav.dataset.id;
    const pressed = fav.getAttribute('aria-pressed') === 'true';
    fav.setAttribute('aria-pressed', String(!pressed));
    // toggle visual (podrías cambiar clases)
    fav.textContent = !pressed ? '❤' : '❤';
    toggleFavorite(id, !pressed);
    return;
  }
});

// ---------- Búsqueda en UI ----------
searchEl.addEventListener('input', (e) => {
  const filtered = filterByName(e.target.value);
  render(filtered);
});

// ---------- Prev / Next handlers ----------
prevBtn.addEventListener('click', () => {
  if (prevUrl) {
    // si usamos paging "ir a" prev, reseteamos items y pedimos prev (puedes decidir acumular o reemplazar)
    // aquí reemplazamos items por la página solicitada para simular navegación por páginas
    items = []; // limpiar acumulado si quieres comportamiento paginado
    fetchAndAppend(prevUrl);
  }
});
nextBtn.addEventListener('click', () => {
  if (nextUrl) {
    fetchAndAppend(nextUrl);
  }
});

// Compatibilidad: loadMoreBtn sigue llamando next
loadMoreBtn.addEventListener('click', () => {
  if (nextUrl) fetchAndAppend(nextUrl);
});

// ---------- Inicio: primera petición ----------
fetchAndAppend(nextUrl);

// ---------- (Opcional) Guardar favoritos en UI al cargar (marca los favs si volvemos a renderizar) ----------
/* Nota: render() ya lee los favoritos en cada render para marcarlos.
   Si quieres aplicar marcados a botones ya existentes sin re-render, podrías recorrer botones en DOM. */
// Selectores nuevos (añade si no los tienes)
const loadingEl = document.getElementById('loading');
const errorBox = document.getElementById('errorBox');
const errorMsg = document.getElementById('errorMsg');
const retryBtn = document.getElementById('retryBtn');

// Estado de UI: helper para mostrar/ocultar loading/error
function showLoading(on = true) {
  if (!loadingEl) return;
  loadingEl.setAttribute('aria-hidden', String(!on));
}
function showError(message = 'Ocurrió un error. Intenta de nuevo.', show = true) {
  if (!errorBox) return;
  errorMsg.textContent = message;
  if (show) {
    errorBox.hidden = false;
  } else {
    errorBox.hidden = true;
  }
}

// Retry handler (se reutiliza la última URL solicitada)
let lastRequestedUrl = null;
retryBtn.addEventListener('click', () => {
  showError('', false);
  if (lastRequestedUrl) fetchAndAppend(lastRequestedUrl);
});

// Modificar fetchAndAppend para usar try/catch/finally y controlar loading
async function fetchAndAppend(url) {
  lastRequestedUrl = url;        // guardamos para "reintentar"
  try {
    setStatus('Cargando personajes…');
    showError('', false);       // ocultar errores previos
    showLoading(true);          // mostrar spinner
    loadMoreBtn.disabled = true;
    prevBtn.disabled = true;
    nextBtn.disabled = true;

    const res = await fetch(url, { cache: "no-store", signal: null }); // puedes agregar timeout con AbortController
    if (!res.ok) {
      // muestras mensaje amable, y logueas error
      throw new Error(`HTTP ${res.status} (${res.statusText})`);
    }
    const data = await res.json();

    nextUrl = data.info.next;
    prevUrl = data.info.prev;

    items = items.concat(data.results);
    render(items);

    // actualizar paginación/ui
    prevBtn.style.display = prevUrl ? '' : 'none';
    nextBtn.style.display = nextUrl ? '' : 'none';
    prevBtn.disabled = !prevUrl;
    nextBtn.disabled = !nextUrl;
    loadMoreBtn.style.display = nextUrl ? '' : 'none';

    setStatus('');
  } catch (err) {
    console.error('Fetch error:', err);
    // Mensaje al usuario: no mostrar stack trace, sino una línea amigable
    showError('No se pudo conectar con el servidor. Revisa tu conexión o intenta más tarde.');
    setStatus('Error al cargar personajes.', true);
  } finally {
    // Siempre ejecutar limpieza: ocultar loading y reactivar botones si aplica
    showLoading(false);
    loadMoreBtn.disabled = false;
    prevBtn.disabled = !prevUrl;
    nextBtn.disabled = !nextUrl;
  }
}

