# 🌦️ App del Clima — Proyecto 5 días

Este es un proyecto de práctica en **JavaScript** que consume la API de [OpenWeatherMap](https://openweathermap.org/api) para mostrar el clima actual de cualquier ciudad.  
Se desarrolló en 5 días, agregando nuevas funcionalidades en cada etapa hasta llegar a una aplicación más robusta y amigable para el usuario.

---

## 📌 Día 1 — Hola Mundo del Clima
- Se hizo la primera conexión con la API de OpenWeather.
- Se mostró la temperatura básica en consola.
- Objetivo: entender cómo funciona `fetch()` y la estructura del JSON de la API.

---

## 📌 Día 2 — Primer Render en el DOM
- Se creó un input y un botón para buscar una ciudad.
- El resultado del clima se mostró en el HTML.
- Se agregó formato básico: ciudad, país y temperatura.
- Objetivo: conectar la API con la interfaz gráfica.

---

## 📌 Día 3 — Mejorando la Presentación
- Se agregó descripción del clima y sensación térmica.
- Se incluyó el **icono oficial de OpenWeather** para representar el clima.
- Se redondearon temperaturas para mayor claridad.
- Objetivo: hacer la UI más visual e informativa.

---

## 📌 Día 4 — Manejo de Errores
- Se manejaron errores comunes:
  - Ciudad no encontrada (404).
  - API key inválida (401).
  - Errores generales de red.
- Se mostraron mensajes de error en pantalla en lugar de solo consola.
- Objetivo: hacer la app más resistente a fallos.

---

## 📌 Día 5 — UX Mejorada + Retry
- Se agregó un **loading spinner** mientras se espera la respuesta.
- Se implementó un **AbortController** con timeout de 10 segundos.
- Se creó un botón de **Reintentar** si ocurre un error.
- Se ocultaron errores automáticamente cuando el usuario vuelve a escribir en el input.
- Se mejoró la accesibilidad con `aria-hidden` y mensajes claros.
- Objetivo: entregar una experiencia completa, clara y fluida.

---

## 🚀 Instalación y Uso

1. Clona este repositorio o descarga el código:
   ```bash
   git clone https://github.com/tuusuario/app-clima.git
