#!/bin/bash

# Script de gerenciamento Docker para Dashboard Chamados
# Porta: 7107

CONTAINER_NAME="dashboard-chamados-container"
IMAGE_NAME="dashboard-chamados:latest"
PORT="7107"

show_help() {
    echo "🚀 Gerenciador Docker - Dashboard Chamados"
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  start      - Iniciar o container"
    echo "  stop       - Parar o container"
    echo "  restart    - Reiniciar o container"
    echo "  logs       - Mostrar logs"
    echo "  status     - Status do container"
    echo "  rebuild    - Recriar imagem e container"
    echo "  remove     - Remover container e imagem"
    echo "  shell      - Entrar no container"
    echo "  help       - Mostrar esta ajuda"
    echo ""
    echo "🌐 URL: http://localhost:$PORT"
}

start_container() {
    echo "🚀 Iniciando Dashboard Chamados..."
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        echo "⚠️  Container já está rodando!"
        echo "🌐 Acesse: http://localhost:$PORT"
        return
    fi
    
    # Verificar se container existe mas está parado
    if docker ps -aq -f name=$CONTAINER_NAME | grep -q .; then
        echo "▶️  Iniciando container existente..."
        docker start $CONTAINER_NAME
    else
        echo "🔧 Criando novo container..."
        docker run -d -p $PORT:$PORT --name $CONTAINER_NAME $IMAGE_NAME
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ Dashboard iniciado com sucesso!"
        echo "🌐 Acesse: http://localhost:$PORT"
    else
        echo "❌ Erro ao iniciar o dashboard"
    fi
}

stop_container() {
    echo "🛑 Parando Dashboard Chamados..."
    docker stop $CONTAINER_NAME 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Dashboard parado com sucesso!"
    else
        echo "⚠️  Container não estava rodando"
    fi
}

restart_container() {
    echo "🔄 Reiniciando Dashboard Chamados..."
    stop_container
    sleep 2
    start_container
}

show_logs() {
    echo "📋 Logs do Dashboard Chamados:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    docker logs $CONTAINER_NAME --tail=30 -f
}

show_status() {
    echo "📊 Status do Dashboard Chamados:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        echo "✅ Status: RODANDO"
        echo "🌐 URL: http://localhost:$PORT"
        echo "🐳 Container: $CONTAINER_NAME"
        echo ""
        docker ps -f name=$CONTAINER_NAME --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        echo "❌ Status: PARADO"
        echo "💡 Use '$0 start' para iniciar"
    fi
}

rebuild_container() {
    echo "🔨 Reconstruindo Dashboard Chamados..."
    
    # Parar e remover container
    docker stop $CONTAINER_NAME 2>/dev/null
    docker rm $CONTAINER_NAME 2>/dev/null
    
    # Recriar imagem
    echo "🏗️  Construindo nova imagem..."
    docker build -t $IMAGE_NAME .
    
    if [ $? -eq 0 ]; then
        echo "✅ Imagem construída com sucesso!"
        start_container
    else
        echo "❌ Erro ao construir imagem"
    fi
}

remove_all() {
    echo "🗑️  Removendo Dashboard Chamados..."
    
    # Parar e remover container
    docker stop $CONTAINER_NAME 2>/dev/null
    docker rm $CONTAINER_NAME 2>/dev/null
    
    # Remover imagem
    docker rmi $IMAGE_NAME 2>/dev/null
    
    echo "✅ Dashboard removido completamente!"
}

enter_shell() {
    echo "🐚 Entrando no container..."
    docker exec -it $CONTAINER_NAME sh
}

# Main script
case "$1" in
    start)
        start_container
        ;;
    stop)
        stop_container
        ;;
    restart)
        restart_container
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    rebuild)
        rebuild_container
        ;;
    remove)
        remove_all
        ;;
    shell)
        enter_shell
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        if [ -z "$1" ]; then
            show_status
        else
            echo "❌ Comando desconhecido: $1"
            echo "💡 Use '$0 help' para ver comandos disponíveis"
            exit 1
        fi
        ;;
esac