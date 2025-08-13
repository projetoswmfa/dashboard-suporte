# Dashboard de Suporte

Sistema de gerenciamento de chamados e atendimentos desenvolvido com React, TypeScript e Supabase.

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca para construção de interfaces
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes de UI reutilizáveis
- **Supabase** - Backend as a Service (BaaS)
- **React Query** - Gerenciamento de estado do servidor
- **React Hook Form** - Gerenciamento de formulários
- **Lucide React** - Ícones

## 📋 Funcionalidades

- ✅ Dashboard com métricas em tempo real
- ✅ Gerenciamento de chamados
- ✅ Sistema de atendimentos
- ✅ Checklist de tarefas
- ✅ Sincronização em tempo real com Supabase
- ✅ Interface responsiva e moderna
- ✅ Autenticação e autorização

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta no Supabase

### Passos para instalação

1. **Clone o repositório**
```bash
git clone https://github.com/projetoswmfa/dashboard-suporte.git
cd dashboard-suporte
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. **Execute o projeto em modo de desenvolvimento**
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:8080`

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run preview` - Visualiza a build de produção
- `npm run lint` - Executa o linter

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── hooks/              # Custom hooks
├── integrations/       # Integrações (Supabase)
├── lib/                # Utilitários e configurações
├── pages/              # Páginas da aplicação
├── types/              # Definições de tipos TypeScript
└── App.tsx             # Componente principal
```

## 🔧 Configuração do Supabase

O projeto utiliza o Supabase para:
- Autenticação de usuários
- Banco de dados PostgreSQL
- Realtime subscriptions
- Storage de arquivos

Certifique-se de configurar as tabelas necessárias no seu projeto Supabase.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato através do email: projetoswmfa@gmail.com

---

Desenvolvido com ❤️ por [projetoswmfa](https://github.com/projetoswmfa)