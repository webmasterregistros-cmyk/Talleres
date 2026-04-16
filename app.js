/* ============================================================
   HeLa 2026 — UI Logic compartida
   Cada página pasa su `modo` ('talleres' | 'visitas' | 'especial')
   ============================================================ */

var claveActual      = '';
var nombreActual     = '';
var telefonoActual   = '';
var tallerSeleccionado = '';

/* Inicializar: llamar desde cada página con su modo */
function initPage(modo) {
  window.__modo = modo;

  document.getElementById('btn-acceder').addEventListener('click', verificarClave);
  document.getElementById('input-clave').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') verificarClave();
  });
}

/* ── Pantalla helpers ── */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function(s) {
    s.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

function setLoading(loading) {
  document.getElementById('btn-acceder').style.display = loading ? 'none' : '';
  document.getElementById('input-clave').disabled = loading;
  document.getElementById('loading-clave').style.display = loading ? 'flex' : 'none';
}

/* ── Verificar clave ── */
async function verificarClave() {
  var clave = document.getElementById('input-clave').value.trim().toUpperCase();
  if (!clave) { document.getElementById('input-clave').focus(); return; }

  claveActual = clave;
  document.getElementById('error-clave').style.display = 'none';
  document.getElementById('ya-inscrito').style.display  = 'none';
  setLoading(true);

  try {
    var data = await api_verificarClave(clave, window.__modo);
    setLoading(false);

    if (!data || data.msg === 'clave_invalida' || data.error) {
      document.getElementById('error-clave').style.display = 'block';
    } else if (data.msg === 'ya_inscrito') {
      document.getElementById('taller-ya').textContent = data.taller || '';
      document.getElementById('ya-inscrito').style.display = 'block';
    } else if (data.ok) {
      nombreActual    = data.nombre   || '';
      telefonoActual  = data.telefono || '';
      document.getElementById('saludo').textContent = '¡Hola, ' + nombreActual + '!';
      showScreen('screen-talleres');
      cargarOpciones();
    }
  } catch (err) {
    setLoading(false);
    document.getElementById('error-clave').style.display = 'block';
    console.error('verificarClave error:', err);
  }
}

function reintentar() {
  document.getElementById('error-clave').style.display = 'none';
  document.getElementById('ya-inscrito').style.display  = 'none';
  setLoading(false);
  var input = document.getElementById('input-clave');
  input.value = '';
  input.focus();
}

/* ── Cargar opciones (talleres / visitas / especiales) ── */
async function cargarOpciones() {
  var grid    = document.getElementById('grid-talleres');
  var loading = document.getElementById('loading-talleres');
  grid.innerHTML = '';
  loading.style.display = 'flex';

  try {
    var opciones = await api_obtenerCupos(window.__modo);
    loading.style.display = 'none';

    if (!opciones || !opciones.length) {
      grid.innerHTML = '<p style="color:var(--text-muted);font-size:.9rem">No hay opciones disponibles.</p>';
      return;
    }

    opciones.forEach(function(t, i) {
      var libres   = typeof t.libres !== 'undefined' ? t.libres : (t.cupo - t.ocupados);
      var total    = t.cupo    || 0;
      var ocupados = t.ocupados || 0;
      var pct      = total > 0 ? Math.round((ocupados / total) * 100) : 100;
      var hayCupo  = libres > 0;
      var barClass = 'progress-bar' + (pct >= 100 ? ' lleno-bar' : pct >= 70 ? ' casi-lleno' : '');

      var card = document.createElement('div');
      card.className = 'taller-card' + (hayCupo ? '' : ' lleno');
      card.style.animation = 'fadeUp .4s ease ' + (i * 0.05) + 's both';
      card.innerHTML =
        '<div class="taller-name">'  + escapeHtml(t.nombre) + '</div>' +
        '<div class="taller-slots"><strong>' + libres + '</strong> de ' + total + ' lugares</div>' +
        '<div class="progress-track"><div class="' + barClass + '" style="width:' + pct + '%"></div></div>' +
        (hayCupo
          ? '<button class="btn btn-success" onclick="abrirModal(\'' + escapeSingle(t.nombre) + '\')">Seleccionar</button>'
          : '<button class="btn btn-disabled" disabled>Sin cupo</button>');

      grid.appendChild(card);
    });

  } catch (err) {
    loading.innerHTML = '<p style="color:var(--error);font-size:.9rem">Error al cargar. Recarga la página.</p>';
    console.error('cargarOpciones error:', err);
  }
}

/* ── Modal ── */
function abrirModal(nombre) {
  tallerSeleccionado = nombre;
  document.getElementById('modal-taller').textContent = nombre;
  document.getElementById('modal').classList.add('active');
}

function cerrarModal() {
  document.getElementById('modal').classList.remove('active');
}

/* ── Confirmar inscripción ── */
async function confirmarInscripcion() {
  var btn = document.getElementById('btn-confirmar');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Registrando…';

  try {
    var data = await api_inscribir(
      claveActual, tallerSeleccionado, nombreActual, telefonoActual, window.__modo
    );
    cerrarModal();
    btn.disabled = false;
    btn.innerHTML = 'Sí, confirmar';

    if (data.msg === 'sin_cupo') {
      alert('Este espacio ya no tiene cupo. Por favor elige otro.');
      cargarOpciones();
    } else if (data.msg === 'ya_inscrito' || !data.ok) {
      alert('Hubo un problema al registrarte. Intenta de nuevo.');
    } else {
      document.getElementById('exito-taller').textContent = tallerSeleccionado;
      showScreen('screen-exito');
    }
  } catch (err) {
    cerrarModal();
    btn.disabled = false;
    btn.innerHTML = 'Sí, confirmar';
    alert('Error de conexión. Intenta de nuevo.');
    console.error('confirmarInscripcion error:', err);
  }
}

/* ── Helpers ── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escapeSingle(str) {
  return String(str).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
}
