const fs = require('fs').promises;
const path = require('path');

const storePath = path.join(__dirname, '..', 'data.json');
const EXPIRATION_MS = 5 * 60 * 1000;

async function ensureStore() {
  try {
    await fs.access(storePath);
  } catch (err) {
    const initial = { saldo: 1.0, historial: [] };
    await fs.writeFile(storePath, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  return loadStore();
}

async function loadStore() {
  const content = await fs.readFile(storePath, 'utf8');
  return JSON.parse(content);
}

async function saveStore(store) {
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), 'utf8');
}

function extractUserFromMessage(message) {
  if (!message || typeof message !== 'string') return 'Usuario Yape';
  const match = message.match(/de\s+(.+?)\s+por/i);
  return match ? match[1].trim() : 'Usuario Yape';
}

function getOrderStatus(order) {
  const now = Date.now();
  if (order.estado === 'Completado') return 'Completado';
  if (now > order.expira) return 'Expirado';
  return 'Pendiente';
}

async function addOrder({ monto, codigo }) {
  const store = await ensureStore();
  const amount = Number(monto);
  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error('Monto inválido');
  }
  const newOrder = {
    id: Date.now(),
    usuario: 'Esperando...',
    monto: Number(amount.toFixed(2)),
    estado: 'Pendiente',
    codigo,
    creadoEn: Date.now(),
    expira: Date.now() + EXPIRATION_MS
  };
  store.historial.unshift(newOrder);
  await saveStore(store);
  return newOrder;
}

async function completeOrder(message) {
  const store = await ensureStore();
  const now = Date.now();
  const text = message.toLowerCase();
  const index = store.historial.findIndex(order =>
    order.estado === 'Pendiente' &&
    text.includes(order.codigo.toLowerCase()) &&
    now <= order.expira
  );

  if (index === -1) {
    return null;
  }

  const order = store.historial[index];
  order.estado = 'Completado';
  order.usuario = extractUserFromMessage(message);
  order.pagadoEn = now;
  store.saldo = Number((store.saldo + order.monto).toFixed(2));
  await saveStore(store);
  return order;
}

async function getState() {
  const store = await ensureStore();
  return {
    saldo: Number(store.saldo.toFixed(2)),
    historial: store.historial.map(order => ({
      ...order,
      estado: getOrderStatus(order)
    }))
  };
}

module.exports = {
  addOrder,
  completeOrder,
  getState
};
