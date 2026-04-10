const WebSocket = require('ws');

let wss = null;

/**
 * Attach a WebSocket server to an existing HTTP server instance.
 * @param {import('http').Server} httpServer
 */
function initWebSocket(httpServer) {
  wss = new WebSocket.Server({ server: httpServer });

  wss.on('connection', (ws, req) => {
    console.log(`[WS] Cliente conectado (${wss.clients.size} total)`);

    ws.on('close', () => {
      console.log(`[WS] Cliente desconectado (${wss.clients.size} restantes)`);
    });

    ws.on('error', (err) => {
      console.error('[WS] Error en cliente:', err.message);
    });

    // Send a welcome ping so the client knows the connection is live
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'connected' }));
    }
  });

  console.log('[WS] Servidor WebSocket inicializado');
}

/**
 * Broadcast a payment-received event to every connected WebSocket client.
 * @param {object} order  The completed order object from dataStore
 */
function broadcastPayment(order) {
  if (!wss) return;

  const payload = JSON.stringify({
    type: 'payment_received',
    order: {
      id: order.id,
      usuario: order.usuario,
      monto: order.monto,
      codigo: order.codigo,
      estado: order.estado,
      pagadoEn: order.pagadoEn
    }
  });

  let sent = 0;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
      sent++;
    }
  });

  console.log(`[WS] Notificación de pago enviada a ${sent} cliente(s)`);
}

module.exports = { initWebSocket, broadcastPayment };
