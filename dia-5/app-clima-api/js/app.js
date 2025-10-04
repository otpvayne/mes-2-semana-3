'use strict';

/* app.js — App del Clima (Día 35)
   - Busca el clima actual usando OpenWeather API
   - Manejo de loading, errores y render en DOM
*/

// >>> CONFIG: reemplaza por tu API key de OpenWeather (no la subas en público)
const API_KEY = '0b4026912f6af0e737a876926440f6d3'; // <-- reemplaza aquí
const API_BASE = 'https://api.openweathermap.org/data/2.5/weather';

// Selectores
const form = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const resultEl = document.getElementById('result');
const loadingEl = document.getElementById('loading');
const errorBox = document.getElementById('errorBox');
const errorMsg = document.getElementById('errorMsg');
const retryBtn = document.getElementById('retryBtn');

let lastCity = null;      // ciudad buscada (para reintentos)
let lastController = null; // AbortController de la petición en curso

// Helpers UI
function showLoading(on = true) {
  if (!loadingEl) return;
  loadingEl.setAttribute('aria-hidden', String(!on));
}
function showError(message = '', visible = true) {
  if (!errorBox) return;
  errorMsg.textContent = message;
  errorBox.hidden = !visible;
}
function clearResult() {
  resultEl.innerHTML = `<p class="placeholder">Introduce una ciudad y presiona Buscar.</p>`;
}

// Render resultado
function renderWeather(data) {
  // data: objeto devuelto por OpenWeather
  const name = data.name;
  const country = data.sys?.country || '';
  const temp = Math.round(data.main?.temp);
  const feels = Math.round(data.main?.feels_like);
  const desc = data.weather?.[0]?.description || '';
  const icon = data.weather?.[0]?.icon || '';

  const iconUrl = icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : '';

  resultEl.innerHTML = `
    <div class="result__content" role="contentinfo">
      <div>
        ${iconUrl ? `<img src="${iconUrl}" alt="${desc}" width="96" height="96">` : ''}
      </div>
      <div>
        <div class="result__title"><strong>${name}${country ? ', ' + country : ''}</strong></div>
        <div class="result__temp">${temp}°C</div>
        <div class="result__desc">Sensación: ${feels}°C — ${desc}</div>
      </div>
    </div>
  `;
}

// Construir URL de request
function buildUrlForCity(city) {
  const q = encodeURIComponent(city.trim());
  return `${API_BASE}?q=${q}&appid=${API_KEY}&units=metric&lang=es`;
}

// Lógica de fetch con manejo de errores, timeout (AbortController) y loading
async function fetchWeatherForCity(city) {
  // Guardar última ciudad solicitada para retry
  lastCity = city;

  // Validación básica
  if (!city || !city.trim()) {
    showError('Escribe el nombre de una ciudad antes de buscar.', true);
    return;
  }

  // Preparar UI
  showError('', false);
  showLoading(true);
  resultEl.innerHTML = ''; // limpiar mientras carga

  // AbortController para timeout
  if (lastController) {
    try { lastController.abort(); } catch(_) {}
  }
  const controller = new AbortController();
  lastController = controller;
  const timeoutMs = 10000; // 10s
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // URL
  const url = buildUrlForCity(city);

  try {
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timeoutId);

    if (!res.ok) {
      // Manejo amigable de errores por status
      if (res.status === 404) {
        showError('Ciudad no encontrada. Verifica el nombre y prueba nuevamente.', true);
      } else if (res.status === 401) {
        showError('API key inválida. Revisa tu configuración.', true);
      } else {
        showError('Error en la petición. Intenta de nuevo más tarde.', true);
      }
      showLoading(false);
      return;
    }

    const data = await res.json();
    // Renderizar datos
    showError('', false);
    renderWeather(data);
    showLoading(false);

  } catch (err) {
    clearTimeout(timeoutId);
    showLoading(false);

    // Distintas causas: abort, network, etc.
    if (err.name === 'AbortError') {
      showError('La solicitud demoró demasiado. Intenta nuevamente.', true);
    } else {
      console.error('Fetch error:', err);
      showError('No se pudo conectar. Revisa tu conexión e intenta otra vez.', true);
    }
  }
}

// Event handlers
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  fetchWeatherForCity(city);
});

retryBtn.addEventListener('click', () => {
  showError('', false);
  if (lastCity) fetchWeatherForCity(lastCity);
});

// Inicial
clearResult();
// -------------------
// Inicialización UI
// -------------------
clearResult();          // placeholder inicial
showError('', false);   // ocultar error al inicio
showLoading(false);     // asegurar spinner oculto
if (errorBox) errorBox.hidden = true; // forzar hidden por seguridad

// Ocultar error cuando el usuario interactúa con el input (mejor UX)
if (cityInput) {
  cityInput.addEventListener('input', () => showError('', false));
  cityInput.addEventListener('focus', () => showError('', false));
}

