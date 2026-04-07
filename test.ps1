# test.ps1 - Script de pruebas para Yape Automático (Windows)

$BASE_URL = "http://localhost:3000"

Write-Host "🔍 Iniciando pruebas de Yape Automático..." -ForegroundColor Cyan
Write-Host ""

# Test 1
Write-Host "1️⃣  Test: GET /api/usuario" -ForegroundColor Yellow
try {
  $Response = Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/api/usuario" | Select-Object -ExpandProperty Content
  Write-Host "Respuesta: $Response"
  if ($Response -match "saldo") {
    Write-Host "✅ PASÓ: Endpoint de usuario funciona" -ForegroundColor Green
  } else {
    Write-Host "❌ FALLÓ: No se contiene saldo" -ForegroundColor Red
  }
} catch {
  Write-Host "❌ ERROR: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2
Write-Host "2️⃣  Test: POST /api/nueva-orden" -ForegroundColor Yellow
try {
  $Body = @{
    monto  = 2.50
    codigo = "555888 gdstore"
  } | ConvertTo-Json
  
  $Response = Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/api/nueva-orden" `
    -Method POST -Body $Body -ContentType 'application/json' | Select-Object -ExpandProperty Content
  
  Write-Host "Respuesta: $Response"
  if ($Response -match "success") {
    Write-Host "✅ PASÓ: Orden creada exitosamente" -ForegroundColor Green
  } else {
    Write-Host "❌ FALLÓ: No se pudo crear la orden" -ForegroundColor Red
  }
} catch {
  Write-Host "❌ ERROR: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3
Write-Host "3️⃣  Test: POST /webhook" -ForegroundColor Yellow
try {
  $Body = @{
    mensaje = "Pago de Juan de 555888 gdstore por prueba"
  } | ConvertTo-Json
  
  $Response = Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/webhook" `
    -Method POST -Body $Body -ContentType 'application/json' | Select-Object -ExpandProperty Content
  
  Write-Host "Respuesta: $Response"
  if ($Response -match "Completado") {
    Write-Host "✅ PASÓ: Webhook procesado, orden marcada como pagada" -ForegroundColor Green
  } else {
    Write-Host "❌ FALLÓ: Webhook no funcionó correctamente" -ForegroundColor Red
  }
} catch {
  Write-Host "❌ ERROR: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4
Write-Host "4️⃣  Test: Verificar saldo actualizado" -ForegroundColor Yellow
try {
  $Response = Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/api/usuario" | Select-Object -ExpandProperty Content
  if ($Response -match "saldo") {
    Write-Host "✅ PASÓ: Saldo actualizado" -ForegroundColor Green
    Write-Host "Estado final: $Response"
  } else {
    Write-Host "❌ FALLÓ: No se pudo verificar saldo" -ForegroundColor Red
  }
} catch {
  Write-Host "❌ ERROR: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "✅ Pruebas completadas" -ForegroundColor Green
Write-Host ""
Write-Host "Para usar en MacroDroid:" -ForegroundColor Cyan
Write-Host "URL: $BASE_URL/webhook"
Write-Host "Método: POST"
Write-Host "Body: {`"mensaje`":`"Pago de NOMBRE de CODIGO gdstore`"}"
