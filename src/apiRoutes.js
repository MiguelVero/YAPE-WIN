const express = require('express');
const { addOrder, completeOrder, getState } = require('./dataStore');

const router = express.Router();

router.post('/api/nueva-orden', async (req, res) => {
  try {
    const { monto, codigo } = req.body;
    if (!monto || !codigo) {
      return res.status(400).json({ error: 'Monto y código son requeridos' });
    }
    const order = await addOrder({ monto, codigo });
    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const { mensaje } = req.body;
    if (!mensaje || typeof mensaje !== 'string') {
      return res.status(400).json({ error: 'Mensaje inválido' });
    }

    const order = await completeOrder(mensaje);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada o ya expirada' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/api/usuario', async (req, res) => {
  try {
    const state = await getState();
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo obtener la información' });
  }
});

module.exports = router;
