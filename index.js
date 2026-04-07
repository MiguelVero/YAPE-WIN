const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('public'));

let datos = {
    saldo: 1.00, 
    historial: []
};

// Recibir notificación de MacroDroid
app.post('/webhook', (req, res) => {
    const { mensaje } = req.body;
    const ahora = Date.now();

    // Busca la orden pendiente que coincida con el código del Yape
    const index = datos.historial.findIndex(h => 
        h.estado === "Pendiente" && 
        mensaje.includes(h.codigo) &&
        ahora < h.expira
    );

    if (index !== -1) {
        let nombreExtraido = "Usuario Yape";
        if(mensaje.includes(" de ")) {
            nombreExtraido = mensaje.split(" de ")[1].split(" por ")[0];
        }
        datos.historial[index].estado = "Completado";
        datos.historial[index].usuario = nombreExtraido;
        datos.saldo += datos.historial[index].monto;
    }
    res.sendStatus(200);
});

// Crear nueva orden con cronómetro de 5 min
app.post('/api/nueva-orden', (req, res) => {
    const { monto, codigo } = req.body;
    const ahora = Date.now();
    const nueva = {
        id: ahora,
        usuario: "Esperando...",
        monto: parseFloat(monto),
        estado: "Pendiente",
        codigo: codigo,
        expira: ahora + (5 * 60 * 1000) // 5 minutos exactos
    };
    datos.historial.unshift(nueva);
    res.json({ success: true });
});

app.get('/api/usuario', (req, res) => {
    res.json(datos);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));