# Yape Automático

Aplicación Express para generar órdenes Yape, recibir notificaciones de webhook y mostrar estado en tiempo real.

## Estructura

- `index.js` - punto de entrada del servidor
- `src/dataStore.js` - almacenamiento persistente en `data.json`
- `src/apiRoutes.js` - rutas API restauradas y webhook
- `public/` - interfaz web, JS y CSS
- `data.json` - datos persistentes de saldo e historial

## Ejecutar localmente

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar servidor:
   ```bash
   npm start
   ```
3. Abrir `http://localhost:3000`

## Despliegue en Railway

Railway detecta `package.json` y usará `Procfile` si existe.

- `web: node index.js`
- Puerto desde `process.env.PORT`

## Uso

- Genera una orden con monto y código
- Copia el código QR o texto
- Envía el webhook a `/webhook` con `{ "mensaje": "..." }`

