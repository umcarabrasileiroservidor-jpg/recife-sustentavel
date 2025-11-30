#!/bin/bash
# Script para testar a aplicação localmente

echo "🚀 Iniciando servidor local para teste..."
echo ""
echo "1. Abra seu navegador em http://localhost:3000"
echo "2. Abra o Console (F12 → Console)"
echo "3. Se houver erros em vermelho, a causa do 'tudo branco' está lá"
echo ""
echo "Para parar o servidor: Ctrl+C"
echo ""

# Simular um servidor HTTP simples usando Node/npx
npx http-server dist -p 3000 -c-1
