const api = {
  nuevoPedido: '/api/nueva-orden',
  estadoUsuario: '/api/usuario',
  webhookHelp: '/webhook'
};

function nav(view) {
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  document.getElementById(view).classList.add('active');
}

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

async function fetchUsuario() {
  const res = await fetch(api.estadoUsuario);
  if (!res.ok) throw new Error('Error al obtener datos');
  return res.json();
}

let lastOrderCount = 0;

async function actualizarPantalla() {
  try {
    const data = await fetchUsuario();
    document.getElementById('saldo').textContent = formatCurrency(data.saldo);

    // Check if new payment arrived
    if (data.historial.length > lastOrderCount) {
      const newOrder = data.historial[0];
      if (newOrder.estado === 'Completado') {
        mostrarNotificacion(newOrder);
      }
    }
    lastOrderCount = data.historial.length;

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

function mostrarNotificacion(order) {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    const notif = new Notification('💜 PAGO RECIBIDO', {
      body: `${order.usuario} pagó ${formatCurrency(order.monto)}`,
      icon: '/yape-static-qr.png',
      tag: 'yape-payment',
      renotify: true
    });
    notif.onclick = () => { window.focus(); notif.close(); };
  }
}

async function solicitarPermisoNotificaciones() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}

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

async function initApp() {
  document.getElementById('btn-open-create').addEventListener('click', () => nav('view-create'));
  document.getElementById('btn-home').addEventListener('click', () => nav('view-home'));
  document.getElementById('btn-generate').addEventListener('click', crearOrden);
  document.getElementById('btn-back-create').addEventListener('click', () => nav('view-home'));
  document.getElementById('btn-back-qr').addEventListener('click', () => nav('view-home'));
  document.getElementById('btn-back-help').addEventListener('click', () => nav('view-home'));
  document.getElementById('btn-howto').addEventListener('click', () => nav('view-help'));
  document.getElementById('webhook-url').textContent = `${window.location.origin}${api.webhookHelp}`;

  await solicitarPermisoNotificaciones();
  await actualizarPantalla();

  // Poll every 2 seconds for updates
  setInterval(actualizarPantalla, 2000);
}

window.addEventListener('DOMContentLoaded', initApp);
