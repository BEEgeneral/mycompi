const API = '';
let ownerKey = '';
let agenteActual = null;
let archivoActual = 'SOUL.md';
let contenidoOriginal = '';
let agentesData = [];

// ─────────────────────────────────────────
// Conexión
// ─────────────────────────────────────────

function conectar() {
  ownerKey = document.getElementById('ownerKey').value;
  if (!ownerKey) {
    showToast('Introduce el owner key', 'error');
    return;
  }
  localStorage.setItem('mycompi_owner_key', ownerKey);
  cargarAgentes();
}

async function apiCall(url, options = {}) {
  const headers = {
    'X-Owner-Key': ownerKey,
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const response = await fetch(API + url, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Error de API');
  return data;
}

// ─────────────────────────────────────────
// Cargar agentes
// ─────────────────────────────────────────

async function cargarAgentes() {
  try {
    const data = await apiCall('/api/admin/agentes');
    agentesData = data.agentes;
    const lista = document.getElementById('agentesLista');
    if (agentesData.length === 0) {
      lista.innerHTML = '<div class="no-data">No hay agentes registrados.</div>';
      return;
    }
    lista.innerHTML = agentesData.map(a => `
      <div class="agent-card" data-id="${a.id}">
        <div class="agent-card-avatar">${a.emoji}</div>
        <div class="agent-card-info">
          <div class="agent-card-nombre">${a.nombre}</div>
          <div class="agent-card-meta">${a.tipo === 'interno' ? 'Agente Interno' : 'Agente Operativo'}</div>
        </div>
        <div class="agent-card-status ${a.activo ? 'activo' : 'inactivo'}"></div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error cargando agentes:', err);
    showToast('Error conectando: ' + err.message, 'error');
    document.getElementById('agentesLista').innerHTML = '<div class="no-data" style="color:#ef4444;">Error: ' + err.message + '</div>';
  }
}

// ─────────────────────────────────────────
// Seleccionar agente
// ─────────────────────────────────────────

async function seleccionarAgente(id) {
  document.querySelectorAll('.agent-card').forEach(c => c.classList.remove('active'));
  document.querySelector(`.agent-card[data-id="${id}"]`).classList.add('active');
  document.getElementById('welcome').style.display = 'none';
  document.getElementById('agenteDetail').classList.add('visible');
  try {
    const data = await apiCall(`/api/admin/agentes/${id}`);
    agenteActual = { ...data.agente, archivos: data.agente.archivos };
    document.getElementById('agenteEmoji').textContent = data.agente.emoji;
    document.getElementById('agenteNombre').textContent = data.agente.nombre;
    document.getElementById('agenteTipo').textContent = data.agente.tipo === 'interno' ? 'Agente Interno' : 'Agente Operativo';
    seleccionarArchivo('SOUL.md');
    cargarClientes(id);
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}

// ─────────────────────────────────────────
// Archivos
// ─────────────────────────────────────────

function seleccionarArchivo(nombre) {
  archivoActual = nombre;
  const archivos = agenteActual.archivos;
  const titulos = {
    'SOUL.md': 'SOUL.md — Personalidad y filosofía',
    'IDENTITY.md': 'IDENTITY.md — Identidad y contexto',
    'SKILL.md': 'SKILL.md — Capacidades y habilidades',
    'MEMORY.md': 'MEMORY.md — Aprendizaje acumulado',
  };
  document.getElementById('editorTitulo').textContent = titulos[nombre] || nombre;
  document.getElementById('editor').value = archivos[nombre] || '';
  contenidoOriginal = archivos[nombre] || '';
  document.querySelectorAll('.file-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.file === nombre);
  });
  document.getElementById('saveBar').classList.remove('visible');
}

function seleccionarTab(tab) {
  document.querySelectorAll('.tab[data-tab]').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.toggle('active', c.id === `tab-${tab}`);
  });
  if (tab === 'metricas') cargarMetricas();
}

function editorInputHandler() {
  const modificado = this.value !== contenidoOriginal;
  document.getElementById('saveBar').classList.toggle('visible', modificado);
  document.getElementById('saveMessage').textContent = modificado ? 'Cambios sin guardar' : 'Guardado';
}

async function guardar() {
  if (!agenteActual) return;
  const contenido = document.getElementById('editor').value;
  const fileMap = {
    'SOUL.md': 'soul',
    'IDENTITY.md': 'identity',
    'SKILL.md': 'skill',
    'MEMORY.md': 'memory',
  };
  try {
    await apiCall(`/api/admin/agentes/${agenteActual.id}`, {
      method: 'PUT',
      body: JSON.stringify({ [fileMap[archivoActual]]: contenido }),
    });
    agenteActual.archivos[archivoActual] = contenido;
    contenidoOriginal = contenido;
    document.getElementById('saveBar').classList.remove('visible');
    showToast('Guardado correctamente', 'success');
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}

function descartar() {
  document.getElementById('editor').value = contenidoOriginal;
  document.getElementById('saveBar').classList.remove('visible');
}

async function recargar() {
  if (agenteActual) {
    await seleccionarAgente(agenteActual.id);
    showToast('Recargado', 'success');
  }
}

// ─────────────────────────────────────────
// Clientes
// ─────────────────────────────────────────

async function cargarClientes(agenteId) {
  const content = document.getElementById('clientesContent');
  content.innerHTML = '<div class="loading"><div class="spinner"></div>Cargando...</div>';
  try {
    const data = await apiCall(`/api/admin/agentes/${agenteId}/clientes`);
    if (!data.clientes || data.clientes.length === 0) {
      content.innerHTML = '<div class="no-data">Este agente aún no tiene clientes. Cuando un cliente lo contrate, aparecerá aquí.</div>';
    } else {
      content.innerHTML = '<div class="clientes-grid">' + data.clientes.map(c => `
        <div class="cliente-card">
          <h4>👤 ${c}</h4>
          <p>Overlay activo — click para ver</p>
        </div>
      `).join('') + '</div>';
    }
  } catch (err) {
    content.innerHTML = `<div class="no-data" style="color:#ef4444;">Error: ${err.message}</div>`;
  }
}

// ─────────────────────────────────────────
// Métricas
// ─────────────────────────────────────────

async function cargarMetricas() {
  const content = document.getElementById('metricasContent');
  content.innerHTML = '<div class="loading"><div class="spinner"></div>Cargando...</div>';
  try {
    const [dashData, estadoData] = await Promise.all([
      apiCall('/api/admin/metrics/dashboard'),
      apiCall('/api/admin/metrics/estado'),
    ]);
    const dash = dashData;
    const est = estadoData;
    const bucketPct = Math.round((est.starter.consumidos / est.starter.maximos) * 100);
    const bucketClass = bucketPct > 80 ? 'danger' : bucketPct > 50 ? 'warning' : '';
    const resetMin = Math.ceil((est.starter.resetEnMs || 0) / 60000);

    content.innerHTML = `
      <div class="bucket-bar">
        <h4>🪣 Bucket Global Starter</h4>
        <div class="bucket-track">
          <div class="bucket-fill ${bucketClass}" style="width:${bucketPct}%"></div>
        </div>
        <div class="bucket-info">
          <span>${est.starter.consumidos} / ${est.starter.maximos} requests</span>
          <span>Reset en ${resetMin} min</span>
        </div>
      </div>

      <div class="metricas-grid">
        <div class="metrica-card">
          <div class="label">Tokens Totales</div>
          <div class="value">${formatNumber(dash.resumen.tokensTotal)}</div>
          <div class="sub">histórico</div>
        </div>
        <div class="metrica-card">
          <div class="label">Sesiones</div>
          <div class="value">${formatNumber(dash.resumen.sessionsTotales)}</div>
          <div class="sub">totales</div>
        </div>
        <div class="metrica-card">
          <div class="label">Gasto Est.</div>
          <div class="value green">$${dash.resumen.gastoTotal.toFixed(4)}</div>
          <div class="sub">total estimado</div>
        </div>
        <div class="metrica-card">
          <div class="label">Sesiones Activas</div>
          <div class="value">${est.sesionesActivas}</div>
          <div class="sub">ahora</div>
        </div>
      </div>

      <div class="seccion-title">Por Plan</div>
      <div class="planes-grid">
        ${Object.entries(est.planes).map(([plan, data]) => `
          <div class="plan-row">
            <span class="plan-nombre">${plan}</span>
            <span class="plan-contador">${data.consumidos} / ${data.limite} req/h</span>
          </div>
        `).join('')}
      </div>

      ${dash.topClientes && dash.topClientes.length > 0 ? `
      <div class="seccion-title">Top Clientes</div>
      <div class="top-clientes">
        ${dash.topClientes.slice(0, 8).map(c => `
          <div class="top-cliente">
            <span class="nombre">👤 ${c.clienteId}</span>
            <div class="stats">
              <div class="costo">$${c.costo.toFixed(4)}</div>
              <div>${formatNumber(c.tokens)} tokens · ${c.turnos} turnos</div>
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}
    `;
  } catch (err) {
    content.innerHTML = `<div class="no-data" style="color:#ef4444;">Error: ${err.message}</div>`;
  }
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function showToast(mensaje, tipo = '') {
  const toast = document.getElementById('toast');
  toast.textContent = mensaje;
  toast.className = 'toast show' + (tipo ? ` ${tipo}` : '');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function tryAutoConnect() {
  const savedKey = localStorage.getItem('mycompi_owner_key');
  if (savedKey && savedKey.length > 0) {
    ownerKey = savedKey;
    document.getElementById('ownerKey').value = savedKey;
    cargarAgentes();
  }
}

// ─────────────────────────────────────────
// Init — se ejecuta cuando el DOM está listo
// ─────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  // Botones
  document.getElementById('btnConectar').addEventListener('click', conectar);
  document.getElementById('btnRecargar').addEventListener('click', recargar);
  document.getElementById('btnGuardarArchivo').addEventListener('click', guardar);
  document.getElementById('btnGuardarSaveBar').addEventListener('click', guardar);
  document.getElementById('btnDescartar').addEventListener('click', descartar);
  document.getElementById('btnActualizarMetricas').addEventListener('click', cargarMetricas);

  // Tabs de archivos
  document.querySelectorAll('.file-tab').forEach(tab => {
    tab.addEventListener('click', () => seleccionarArchivo(tab.dataset.file));
  });

  // Tabs principales
  document.querySelectorAll('.tab[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => seleccionarTab(tab.dataset.tab));
  });

  // Editor input
  document.getElementById('editor').addEventListener('input', editorInputHandler);

  // Click en tarjetas de agente (delegación)
  document.addEventListener('click', function(e) {
    const card = e.target.closest('.agent-card');
    if (card) seleccionarAgente(card.dataset.id);
  });

  // Auto-conectar si hay key guardada
  tryAutoConnect();
});
