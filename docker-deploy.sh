#!/bin/bash

# Script de deploy Docker para Dashboard Chamados
# Porta: 7107

echo "🚀 Iniciando deploy do Dashboard Chamados na porta 7107..."

# Parar container existente (se houver)
echo "🛑 Parando containers existentes..."
docker-compose down 2>/dev/null || true

# Limpar imagens antigas (opcional)
echo "🧹 Limpando imagens antigas..."
docker image prune -f

# Build da nova imagem
echo "🔨 Construindo nova imagem..."
docker-compose build --no-cache

# Subir o container
echo "🚀 Iniciando container na porta 7107..."
docker-compose up -d

# Verificar status
echo "✅ Verificando status do container..."
sleep 5
docker-compose ps

# Mostrar logs
echo "📋 Logs do container:"
docker-compose logs --tail=20

echo ""
echo "🎉 Deploy concluído!"
echo "🌐 Aplicação disponível em: http://localhost:7107"
echo "📊 Monitorar logs: docker-compose logs -f"
echo "🛑 Parar aplicação: docker-compose down"