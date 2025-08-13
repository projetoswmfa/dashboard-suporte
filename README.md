# 🎯 Dashboard de Suporte - Sistema de Gerenciamento de Chamados

Um sistema moderno e responsivo para gerenciamento de chamados de suporte técnico, desenvolvido com React, TypeScript e Supabase.

## 📋 Funcionalidades

### ✨ Principais Recursos
- **Gerenciamento de Chamados**: Criação, edição e acompanhamento de chamados
- **Sistema de Checklist**: Checklists aninhados para acompanhamento detalhado
- **Dashboard Interativo**: Visualização em tempo real com gráficos e métricas
- **Filtros Avançados**: Filtros por equipe, status, responsável e prioridade
- **Notificações**: Sistema de notificações sonoras para novos chamados
- **Responsivo**: Interface adaptável para desktop e mobile

### 🎨 Interface
- Design moderno com Tailwind CSS
- Componentes reutilizáveis com shadcn/ui
- Tema escuro/claro (configurável)
- Animações suaves com Framer Motion
- Ícones consistentes com Lucide React

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI
- **Framer Motion** - Animações
- **Recharts** - Gráficos e visualizações
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### Backend & Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados
- **Row Level Security (RLS)** - Segurança de dados

### DevOps & Deploy
- **Docker** - Containerização
- **Nginx** - Servidor web
- **Docker Compose** - Orquestração

## 📁 Estrutura do Projeto

```
dashboard-suporte/
├── src/
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes base (shadcn/ui)
│   │   ├── AttendanceCard.tsx
│   │   ├── AttendanceForm.tsx
│   │   ├── ChecklistManager.tsx
│   │   ├── Dashboard.tsx
│   │   ├── FilterBar.tsx
│   │   └── NotificationSystem.tsx
│   ├── hooks/              # Custom hooks
│   │   ├── useAttendances.ts
│   │   ├── useChecklistItems.ts
│   │   ├── useNotifications.ts
│   │   └── useRealtimeUpdates.ts
│   ├── integrations/       # Integrações externas
│   │   └── supabase/
│   │       ├── client.ts   # Cliente Supabase
│   │       └── types.ts    # Tipos do banco
│   ├── lib/               # Utilitários
│   │   └── utils.ts
│   ├── pages/             # Páginas da aplicação
│   │   ├── Index.tsx
│   │   └── NotFound.tsx
│   ├── types/             # Definições de tipos
│   │   ├── attendance.ts
│   │   └── checklist.ts
│   ├── App.tsx            # Componente principal
│   └── main.tsx           # Ponto de entrada
├── public/                # Arquivos estáticos
├── supabase/             # Configurações Supabase
│   ├── config.toml
│   └── migrations/       # Migrações do banco
├── docker-compose.yml    # Configuração Docker
├── Dockerfile           # Imagem Docker
├── nginx.conf          # Configuração Nginx
└── package.json        # Dependências
```

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Docker (opcional)
- Conta no Supabase

### 1. Clone o repositório
```bash
git clone https://github.com/projetoswmfa/dashboard-suporte.git
cd dashboard-suporte
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 4. Configure o Supabase

#### 4.1. Crie um novo projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie a URL e a chave anônima

#### 4.2. Execute as migrações
```bash
# Opção 1: Via Supabase CLI (recomendado)
supabase db push

# Opção 2: Execute manualmente no SQL Editor do Supabase
# Copie e execute o conteúdo dos arquivos em supabase/migrations/
```

### 5. Execute o projeto

#### Desenvolvimento
```bash
npm run dev
```
Acesse: http://localhost:5173

#### Produção (Docker)
```bash
# Build e start
docker-compose up -d

# Ou use os scripts de gerenciamento
./docker-deploy.sh
```
Acesse: http://localhost:7107

## 🐳 Docker

### Scripts de Gerenciamento
O projeto inclui scripts para facilitar o gerenciamento Docker:

```bash
# Deploy completo
./docker-deploy.sh

# Gerenciamento do container
./docker-manage.sh [comando]

# Comandos disponíveis:
# start    - Iniciar container
# stop     - Parar container  
# restart  - Reiniciar container
# logs     - Ver logs
# status   - Status do container
# rebuild  - Recriar imagem
# remove   - Remover tudo
# shell    - Entrar no container
```

### Configuração Docker
- **Porta**: 7107
- **Nginx**: Servidor web otimizado
- **Multi-stage build**: Imagem otimizada
- **Health check**: Monitoramento automático

## 📊 Banco de Dados

### Tabelas Principais

#### `attendances`
- Armazena os chamados de suporte
- Campos: id, team, status, responsible, dates, priority, etc.
- Suporte a múltiplos responsáveis

#### `checklist_items`
- Itens de checklist para cada chamado
- Suporte a estrutura hierárquica (aninhada)
- Prevenção de referências circulares

### Funcionalidades do Banco
- **Row Level Security (RLS)**: Segurança de acesso
- **Triggers**: Atualização automática de timestamps
- **Índices**: Otimização de consultas
- **Validações**: Integridade dos dados

## 🎯 Uso do Sistema

### Dashboard Principal
- Visualize métricas em tempo real
- Gráficos de status e prioridades
- Filtros dinâmicos
- Lista de chamados ativos

### Gerenciamento de Chamados
1. **Criar**: Clique em "Novo Chamado"
2. **Editar**: Clique no chamado desejado
3. **Filtrar**: Use a barra de filtros
4. **Acompanhar**: Visualize o progresso em tempo real

### Sistema de Checklist
- Crie checklists detalhados
- Organize em estrutura hierárquica
- Marque itens como concluídos
- Acompanhe o progresso automaticamente

## 🔧 Desenvolvimento

### Scripts Disponíveis
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Verificar código
```

### Estrutura de Componentes
- **Componentes UI**: Baseados em shadcn/ui
- **Custom Hooks**: Lógica reutilizável
- **Types**: Tipagem TypeScript completa
- **Utils**: Funções utilitárias

### Padrões de Código
- TypeScript strict mode
- ESLint + Prettier
- Componentes funcionais
- Custom hooks para lógica
- Tipagem completa

## 🚀 Deploy

### Opções de Deploy

#### 1. Docker (Recomendado)
```bash
# Clone e configure
git clone https://github.com/projetoswmfa/dashboard-suporte.git
cd dashboard-suporte

# Configure .env
cp .env.example .env
# Edite as variáveis

# Deploy
./docker-deploy.sh
```

#### 2. Build Manual
```bash
npm install
npm run build
# Sirva a pasta dist/ com seu servidor web
```

#### 3. Plataformas Cloud
- Vercel
- Netlify  
- Railway
- Render

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma [issue](https://github.com/projetoswmfa/dashboard-suporte/issues)
- Entre em contato com a equipe de desenvolvimento

## 🎉 Agradecimentos

- [React](https://reactjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vite](https://vitejs.dev/)

---

**Desenvolvido com ❤️ pela equipe de TI**