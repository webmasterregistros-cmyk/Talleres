/* ============================================================
   HeLa 2026 — API Client
   Reemplaza google.script.run con fetch() hacia Apps Script
   ============================================================

   CONFIGURACIÓN:
   Cambia APPS_SCRIPT_URL por la URL de tu Web App desplegada.
   En Apps Script: Implementar > Nueva implementación > Aplicación web
   → Ejecutar como: Yo  |  Quién tiene acceso: Cualquier usuario
   ============================================================ */

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzmDuZ97z9nf0YKUe4aVl1PhewSzwlPMZnBjf-7M2UTGlYd9G8h6ZBXGsrwp4GYB45Ksw/exec';

/**
 * Llama al Apps Script con los parámetros dados.
 * @param {Object} params - Parámetros a enviar como query string
 * @returns {Promise<Object>} - JSON de respuesta
 */
async function apiCall(params) {
  const url = new URL(APPS_SCRIPT_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const resp = await fetch(url.toString(), {
    method: 'GET',
    redirect: 'follow',
  });

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

/* ── Funciones públicas usadas por cada página ── */

async function api_verificarClave(clave, modo) {
  return apiCall({ accion: 'verificar', clave, modo });
}

async function api_obtenerCupos(modo) {
  return apiCall({ accion: 'cupos', modo });
}

async function api_inscribir(clave, taller, nombre, telefono, modo) {
  return apiCall({ accion: 'inscribir', clave, taller, nombre, telefono, modo });
}
