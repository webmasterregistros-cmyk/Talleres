# HeLa 2026 — GitHub Pages + Apps Script

## Estructura del proyecto

```
hela2026/
├── css/
│   └── style.css          ← Estilos compartidos
├── js/
│   ├── api.js             ← Cliente HTTP (fetch → Apps Script)
│   └── app.js             ← Lógica de UI compartida
├── talleres.html          ← Página de talleres
├── visitas.html           ← Página de visitas empresariales
├── especial.html          ← Página de talleres especiales
├── Code.gs                ← Backend Apps Script (copiar al editor)
└── README.md
```

---

## Paso 1 — Desplegar el Apps Script como Web App

1. Abre tu proyecto en **script.google.com**
2. Reemplaza el contenido de `Code.gs` con el archivo `Code.gs` de este proyecto
3. Haz clic en **Implementar → Nueva implementación**
4. Tipo: **Aplicación web**
5. Configuración:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario** ← importante para que GitHub Pages pueda llamarlo
6. Copia la **URL de implementación** (termina en `/exec`)

---

## Paso 2 — Configurar la URL en el frontend

Abre `js/api.js` y reemplaza la línea:

```js
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/TU_DEPLOYMENT_ID_AQUI/exec';
```

con tu URL real, por ejemplo:

```js
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx.../exec';
```

---

## Paso 3 — Publicar en GitHub Pages

1. Crea un repositorio en GitHub (puede ser privado o público)
2. Sube todos los archivos **excepto `Code.gs`** manteniendo la estructura de carpetas
3. Ve a **Settings → Pages**
4. Source: **Deploy from a branch** → `main` → `/ (root)`
5. Espera ~1 minuto y tu sitio estará en:
   `https://TU_USUARIO.github.io/TU_REPO/talleres.html`

---

## URLs de cada formulario

| Formulario | URL |
|---|---|
| Talleres | `/talleres.html` |
| Visitas Empresariales | `/visitas.html` |
| Talleres Especiales | `/especial.html` |

---

## Por qué funciona (diferencia técnica)

| | Versión original | Esta versión |
|---|---|---|
| Frontend | Dentro de Apps Script (HtmlService) | GitHub Pages (HTML estático) |
| Comunicación | `google.script.run` (solo funciona dentro de Apps Script) | `fetch()` con URL pública |
| CORS | No aplica | Apps Script permite `*` en Web Apps públicas |

> **Nota:** Apps Script automáticamente permite CORS en Web Apps configuradas como
> "Cualquier usuario". No necesitas agregar headers manualmente.

---

## Solución de problemas

**Error CORS en consola del navegador**
→ Verifica que en la implementación pusiste "Quién tiene acceso: Cualquier usuario"
→ Si modificas el código, debes crear una **nueva implementación** (no editar la existente)

**La clave no se encuentra**
→ Confirma que la columna de claves (índice 8, columna I) y estados (índice 10, columna K) sean correctas en tu hoja "Ventas"

**Los cambios en Code.gs no se reflejan**
→ Apps Script cachea implementaciones. Siempre crea una nueva implementación y actualiza la URL en `api.js`
