const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('public'));

// Saldo inicial en 1.00 como pediste
let datos = {
    saldo: 1.00, 
    historial: []
};

// 1. Recibir notificación de MacroDroid
app.post('/webhook', (req, res) => {
    const { mensaje } = req.body;
    console.log("Mensaje de Yape recibido:", mensaje);

    // Buscamos el código pendiente
    const index = datos.historial.findIndex(h => h.estado === "Pendiente" && mensaje.includes(h.codigo));

    if (index !== -1) {
        // Intentamos sacar el nombre (Yape suele enviar: "Yape de Juan Perez por S/...")
        // Si no lo encuentra, pondrá "Usuario Yape"
        let nombreExtraido = "Usuario Yape";
        if(mensaje.includes(" de ")) {
            nombreExtraido = mensaje.split(" de ")[1].split(" por ")[0];
        }

        datos.historial[index].estado = "Completado";
        datos.historial[index].usuario = nombreExtraido; // Guardamos el nombre real
        datos.saldo += datos.historial[index].monto;
        console.log(`¡Pago Confirmado de ${nombreExtraido}!`);
    }
    res.sendStatus(200);
});

// 2. Crear nueva orden
app.post('/api/nueva-orden', (req, res) => {
    const { monto, codigo } = req.body;
    const nueva = {
        id: Date.now(),
        operacion: "Yape",
        usuario: "Esperando...", // Aquí cambiará al nombre real luego
        monto: parseFloat(monto),
        estado: "Pendiente",
        codigo: codigo
    };
    datos.historial.unshift(nueva);
    res.json({ success: true });
});

app.get('/api/usuario', (req, res) => {
    res.json(datos);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor listo en puerto ${PORT}`));