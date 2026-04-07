# 🚀 Despliegue en Railway

## Paso 1: Conectar tu repositorio Git

1. Ve a [railway.app](https://railway.app)
2. Crea una cuenta (o inicia sesión)
3. Haz clic en **"New Project"**
4. Selecciona **"Deploy from GitHub"**
5. Conecta tu cuenta de GitHub y autoriza Railway
6. Busca y selecciona tu repositorio `yape`

## Paso 2: Railway configura automáticamente

Railway detectará:
- `package.json` ✓
- `Procfile` ✓
- Su contenido: `web: node index.js`

## Paso 3: Variables de entorno

Railway asignará automáticamente un `PORT`. No necesitas configurar nada.

## Paso 4: Desplegar

1. Presiona el botón **"Deploy"**
2. Railway construirá e iniciará tu app
3. Verás una URL como: `https://yape-prod-xxxx.up.railway.app`

## Paso 5: Configurar el Webhook en MacroDroid

1. En Railway, abre tu proyecto
2. Haz clic en la pestaña **"Domain"**
3. Copia la URL generada
4. En MacroDroid, crea una acción:
   - **Acción**: HTTP Request
   - **URL**: `https://tu-dominio-railway.up.railway.app/webhook`
   - **Método**: POST
   - **Content-Type**: application/json
   - **Body**:
     ```json
     {
       "mensaje": "Pago de %contact_name de %sms_from por %sms_text"
     }
     ```

## Verificar despliegue

```bash
curl https://tu-dominio.up.railway.app/api/usuario
```

Deberías ver el JSON con tu saldo e historial.

## 📝 Notas

- El saldo y las órdenes se guardan en `data.json` (temporal)
- Cada vez que redepliegues, los datos se resetean
- Para datos persistentes, necesitarías una base de datos (PostgreSQL en Railway es fácil)
- El QR fijo está en `public/yape-static-qr.png`
- Las órdenes expiran en 5 minutos automáticamente
