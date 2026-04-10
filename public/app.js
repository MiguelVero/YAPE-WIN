const api = {
  nuevoPedido: '/api/nueva-orden',
  estadoUsuario: '/api/usuario',
  webhookHelp: '/webhook'
};

// ── Navigation ────────────────────────────────────────────
function nav(view) {
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  document.getElementById(view).classList.add('active');
}

// ── Formatting helpers ────────────────────────────────────
function formatCurrency(value) {
  return `S/. ${Number(value).toFixed(2)}`;
}

function formatTime(ms) {
  if (ms <= 0) return 'Expirado';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ── Data fetching ─────────────────────────────────────────
async function fetchUsuario() {
  const res = await fetch(api.estadoUsuario);
  if (!res.ok) throw new Error('Error al obtener datos');
  return res.json();
}

// ── Render order table ────────────────────────────────────
async function actualizarPantalla() {
  try {
    const data = await fetchUsuario();
    document.getElementById('saldo').textContent = formatCurrency(data.saldo);

    const ahora = Date.now();
    const filas = data.historial.map(order => {
      const resta = order.expira - ahora;
      const estado = order.estado === 'Completado'
        ? '✅ PAGADO'
        : resta <= 0
          ? '❌ EXPIRADO'
          : `⌛ ${formatTime(resta)}`;

      const clase = order.estado === 'Completado'
        ? 'row-c'
        : resta <= 0
          ? 'row-e'
          : 'row-p';

      return `
        <tr class="${clase}">
          <td><button type="button" class="btn-view" onclick="mostrarCodigo('${order.codigo}')">Ver</button></td>
          <td>${order.usuario}</td>
          <td>${formatCurrency(order.monto)}</td>
          <td>${estado}</td>
        </tr>
      `;
    }).join('');

    document.getElementById('order-list').innerHTML = filas || '<tr><td colspan="4">No hay órdenes</td></tr>';
  } catch (error) {
    console.error(error);
  }
}

function mostrarCodigo(codigo) {
  alert(`Código para Yape:\n${codigo}`);
}

function generarCodigo(length = 6) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

// ── Create order ──────────────────────────────────────────
async function crearOrden() {
  const montoInput = document.getElementById('monto');
  const monto = Number(montoInput.value);
  if (!monto || monto <= 0) {
    return alert('Ingresa un monto válido para la orden');
  }

  const token = generarCodigo();
  const codigo = `${token} gdstore`;

  const response = await fetch(api.nuevoPedido, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ monto, codigo })
  });

  const body = await response.json();
  if (!response.ok) {
    return alert(body.error || 'No se pudo crear la orden');
  }

  document.getElementById('qr-text').textContent = codigo;
  document.getElementById('qr-image').src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(codigo)}`;
  nav('view-qr');
}

// ── Push notification permission ──────────────────────────
async function solicitarPermisoNotificaciones() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    const result = await Notification.requestPermission();
    console.log('[Notif] Permiso:', result);
  }
}

function mostrarNotificacionLocal(order) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const title = '💜 Pago recibido';
  const body = `${order.usuario} pagó ${formatCurrency(order.monto)}`;
  const notif = new Notification(title, {
    body,
    icon: '/yape-static-qr.png',
    tag: `yape-${order.id}`,
    renotify: true
  });
  notif.onclick = () => { window.focus(); notif.close(); };
}

// ── Service Worker registration ───────────────────────────
async function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register('/service-worker.js');
    console.log('[SW] Registrado:', reg.scope);

    // Listen for messages from the SW (e.g. notification click)
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'notification_click') {
        nav('view-home');
        actualizarPantalla();
      }
    });
  } catch (err) {
    console.warn('[SW] No se pudo registrar:', err.message);
  }
}

// ── WebSocket for real-time updates ──────────────────────
function conectarWebSocket() {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${location.host}`;
  let ws;
  let reconnectDelay = 2000;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.addEventListener('open', () => {
      console.log('[WS] Conectado al servidor');
      reconnectDelay = 2000; // reset backoff on successful connection
    });

    ws.addEventListener('message', (event) => {
      let msg;
      try { msg = JSON.parse(event.data); } catch (_) { return; }

      if (msg.type === 'payment_received') {
        console.log('[WS] Pago recibido:', msg.order);
        // Immediately refresh the UI — no polling delay needed
        actualizarPantalla();
        // Show a local notification
        mostrarNotificacionLocal(msg.order);
      }
    });

    ws.addEventListener('close', () => {
      console.log(`[WS] Desconectado. Reintentando en ${reconnectDelay / 1000}s…`);
      setTimeout(connect, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 2, 30000); // exponential backoff, max 30s
    });

    ws.addEventListener('error', (err) => {
      console.warn('[WS] Error de conexión:', err);
      ws.close();
    });
  }

  connect();
}

// ── App bootstrap ─────────────────────────────────────────
async function initApp() {
  document.getElementById('btn-open-create').addEventListener('click', () => nav('view-create'));
  document.getElementById('btn-home').addEventListener('click', () => nav('view-home'));
  document.getElementById('btn-generate').addEventListener('click', crearOrden);
  document.getElementById('btn-back-create').addEventListener('click', () => nav('view-home'));
  document.getElementById('btn-back-qr').addEventListener('click', () => nav('view-home'));
  document.getElementById('btn-back-help').addEventListener('click', () => nav('view-home'));
  document.getElementById('btn-howto').addEventListener('click', () => nav('view-help'));
  document.getElementById('webhook-url').textContent = `${window.location.origin}${api.webhookHelp}`;

  // Initial data load
  await actualizarPantalla();

  // Fallback polling every 15 s (WebSocket handles instant updates)
  setInterval(actualizarPantalla, 15000);

  // Register Service Worker and request notification permission
  await registrarServiceWorker();
  await solicitarPermisoNotificaciones();

  // Open persistent WebSocket connection
  conectarWebSocket();
}

window.addEventListener('DOMContentLoaded', initApp);

