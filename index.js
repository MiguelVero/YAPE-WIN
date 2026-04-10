const express = require('express');
const http = require('http');
const path = require('path');
const apiRoutes = require('./src/apiRoutes');
const { initWebSocket } = require('./src/notificationService');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', apiRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
initWebSocket(server);

server.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
