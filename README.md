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

- Abre `http://localhost:3000`
- Pulsa `Crear orden` y elige el monto
- Copia el código o usa el QR generado
- También puedes usar el QR fijo de tu cuenta para pagos directos
- Configura MacroDroid para enviar un POST a `/webhook`
- Usa JSON como:
  ```json
  {
    "mensaje": "Pago de Usuario de 123456 gdstore"
  }
  ```
- El servidor acepta `mensaje`, `message` o `msg` como campo de entrada

