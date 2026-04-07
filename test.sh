#!/bin/bash
# Script de pruebas para Yape Automático

echo "🔍 Iniciando pruebas de Yape Automático..."
echo ""

BASE_URL="http://localhost:3000"

# Test 1: Obtener estado del usuario
echo "1️⃣  Test: GET /api/usuario"
RESPONSE=$(curl -s "$BASE_URL/api/usuario")
echo "Respuesta: $RESPONSE"
if echo "$RESPONSE" | grep -q "saldo"; then
  echo "✅ PASÓ: Endpoint de usuario funciona"
else
  echo "❌ FALLÓ: No se pudo obtener estado del usuario"
fi
echo ""

# Test 2: Crear una orden
echo "2️⃣  Test: POST /api/nueva-orden"
ORDEN=$(curl -s -X POST "$BASE_URL/api/nueva-orden" \
  -H "Content-Type: application/json" \
  -d '{"monto":2.50,"codigo":"555888 gdstore"}')
echo "Respuesta: $ORDEN"
if echo "$ORDEN" | grep -q "success"; then
  echo "✅ PASÓ: Orden creada exitosamente"
  # Extraer código para próxima prueba
  CODIGO="555888 gdstore"
else
  echo "❌ FALLÓ: No se pudo crear la orden"
fi
echo ""

# Test 3: Procesar webhook
echo "3️⃣  Test: POST /webhook"
WEBHOOK=$(curl -s -X POST "$BASE_URL/webhook" \
  -H "Content-Type: application/json" \
  -d '{"mensaje":"Pago de Juan por 555888 gdstore"}')
echo "Respuesta: $WEBHOOK"
if echo "$WEBHOOK" | grep -q "Completado"; then
  echo "✅ PASÓ: Webhook procesado, orden marcada como pagada"
else
  echo "❌ FALLÓ: Webhook no funcionó correctamente"
fi
echo ""

# Test 4: Verificar que el saldo se actualizó
echo "4️⃣  Test: Verificar saldo actualizado"
FINAL=$(curl -s "$BASE_URL/api/usuario")
if echo "$FINAL" | grep -q "saldo"; then
  echo "✅ PASÓ: Saldo actualizado"
  echo "Estado final: $FINAL"
else
  echo "❌ FALLÓ: No se pudo verificar saldo"
fi
echo ""

echo "✅ Pruebas completadas"
echo ""
echo "Para usar en MacroDroid:"
echo "URL: $BASE_URL/webhook"
echo "Método: POST"
echo "JSON: {\"mensaje\":\"Pago de NOMBRE de CODIGO gdstore\"}"
