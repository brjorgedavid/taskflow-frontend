# TaskFlow Frontend

Interface web moderna e responsiva para o sistema de gerenciamento de funcionários e férias TaskFlow.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Como Executar](#como-executar)
- [Build para Produção](#build-para-produção)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Integração com Backend](#integração-com-backend)
- [Docker](#docker)

## 🚀 Sobre o Projeto

O TaskFlow Frontend é uma aplicação React moderna que fornece uma interface intuitiva para gerenciar funcionários, solicitações de férias e aprovações. A aplicação implementa autenticação JWT, controle de acesso baseado em roles e uma experiência de usuário fluida com Material-UI.

## 🛠️ Tecnologias Utilizadas

### Core
- **React 18.2** - Biblioteca JavaScript para construção de interfaces
- **Vite 7.2** - Build tool e dev server ultra-rápido
- **Redux Toolkit 1.9** - Gerenciamento de estado global
- **React Redux 8.1** - Bindings oficiais do Redux para React

### UI/UX
- **Material-UI (MUI) 5.14** - Biblioteca de componentes React
- **@mui/icons-material** - Ícones do Material Design
- **@emotion/react & @emotion/styled** - CSS-in-JS para estilização
- **Recharts 3.6** - Biblioteca de gráficos para React

### Utilitários
- **date-fns 4.1** - Biblioteca moderna para manipulação de datas
- **Redux** - Gerenciamento de estado previsível

### Desenvolvimento
- **ESLint 9.39** - Linter para JavaScript/React
- **Vite Plugin React** - Plugin oficial do React para Vite
- **ESLint Plugins** - Plugins para React Hooks e React Refresh

## 📦 Pré-requisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (ou yarn/pnpm)
- **Backend TaskFlow** rodando em `http://localhost:8080`

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd taskflow-frontend/taskflow
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (se necessário):
```bash
cp .env.example .env
```

## 🚀 Como Executar

### Modo Desenvolvimento

Inicie o servidor de desenvolvimento com hot-reload:

```bash
npm run dev
```

A aplicação estará disponível em: **http://localhost:5173**

### Lint

Execute o linter para verificar problemas no código:

```bash
npm run lint
```

### Preview

Visualize a build de produção localmente:

```bash
npm run preview
```

## 📦 Build para Produção

Crie uma build otimizada para produção:

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

## 📁 Estrutura do Projeto

```
src/
├── api/                    # Configuração e chamadas à API
│   ├── apiClient.js       # Configuração do cliente HTTP
│   └── endpoints/         # Endpoints organizados por recurso
│
├── assets/                # Recursos estáticos (imagens, ícones)
│
├── components/            # Componentes reutilizáveis
│   ├── common/           # Componentes comuns (Button, Input, etc)
│   ├── layout/           # Componentes de layout (Header, Sidebar)
│   └── forms/            # Componentes de formulário
│
├── contexts/              # Context API providers
│   └── AuthContext.jsx   # Contexto de autenticação
│
├── features/              # Features organizadas por domínio
│   ├── auth/             # Autenticação e login
│   ├── employees/        # Gestão de funcionários
│   └── vacations/        # Gestão de férias
│
├── pages/                 # Páginas da aplicação
│   ├── Login/            # Página de login
│   ├── Dashboard/        # Dashboard principal
│   ├── Employees/        # Listagem e gestão de funcionários
│   └── Vacations/        # Listagem e gestão de férias
│
├── store/                 # Redux store
│   ├── index.js          # Configuração da store
│   └── slices/           # Slices do Redux
│
├── styles/                # Estilos globais e temas
│   └── theme.js          # Tema customizado do MUI
│
├── utils/                 # Utilitários e helpers
│   ├── formatters.js     # Formatadores de dados
│   ├── validators.js     # Validadores
│   └── constants.js      # Constantes da aplicação
│
├── App.jsx               # Componente raiz
├── main.jsx              # Ponto de entrada
└── index.css             # Estilos globais base
```

## ✨ Funcionalidades

### Autenticação
- ✅ Login com email e senha
- ✅ Armazenamento seguro de token JWT
- ✅ Logout e limpeza de sessão
- ✅ Proteção de rotas baseada em autenticação

### Dashboard
- ✅ Visão geral de funcionários e férias
- ✅ Gráficos e estatísticas
- ✅ Informações personalizadas por role

### Gestão de Funcionários
- ✅ Listagem paginada de funcionários
- ✅ Busca e filtros avançados
- ✅ Criação de novos funcionários (ADMIN)
- ✅ Edição de dados de funcionários
- ✅ Exclusão de funcionários (ADMIN)
- ✅ Visualização de perfil detalhado

### Gestão de Férias
- ✅ Solicitação de férias (EMPLOYEE)
- ✅ Listagem de solicitações
- ✅ Aprovação/Rejeição de férias (MANAGER)
- ✅ Histórico completo de férias
- ✅ Validação de sobreposição de datas
- ✅ Comentários em aprovações/rejeições

### Controle de Acesso
- ✅ **ADMIN**: Acesso completo a todas as funcionalidades
- ✅ **MANAGER**: Gerenciamento de equipe e aprovação de férias
- ✅ **EMPLOYEE**: Acesso aos próprios dados e solicitação de férias

## 🔗 Integração com Backend

### Configuração da API

O frontend se conecta ao backend através da configuração em `src/api/apiClient.js`:

```javascript
const API_BASE_URL = 'http://localhost:8080';
```

### Autenticação

Todas as requisições autenticadas incluem o token JWT no header:

```
Authorization: Bearer <token>
```

O token é armazenado no localStorage após o login bem-sucedido.

### Endpoints Principais

- `POST /auth/login` - Autenticação
- `GET /employees` - Listar funcionários
- `POST /employees` - Criar funcionário
- `PATCH /employees/:id` - Atualizar funcionário
- `DELETE /employees/:id` - Excluir funcionário
- `GET /vacations` - Listar férias
- `POST /vacations` - Criar solicitação de férias
- `PATCH /vacations/:id/decision` - Aprovar/Rejeitar férias

## 🐳 Docker

### Build da Imagem

```bash
docker build -t taskflow-frontend .
```

### Executar Container

```bash
docker run -p 80:80 taskflow-frontend
```

### Docker Compose

O frontend faz parte do `docker-compose.yml` na raiz do projeto:

```yaml
frontend:
  build:
    context: ./taskflow-frontend/taskflow
    dockerfile: Dockerfile
  container_name: taskflow-frontend
  ports:
    - "80:80"
  depends_on:
    - backend
```

Execute com:

```bash
# Na pasta raiz do projeto (taskflow)
./docker.sh start
```

A aplicação estará disponível em: **http://localhost**

## 🎨 Customização do Tema

O tema do Material-UI pode ser customizado em `src/styles/theme.js`:

```javascript
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  // ... outras customizações
});
```

## 📝 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8080
```

Acesse as variáveis no código:

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 🔐 Credenciais Padrão

Para testes, use as seguintes credenciais:

**Administrador:**
- Email: `lionel.messi@example.com`
- Senha: `@@Senha123`

**Gerente:**
- Email: `cristiano.ronaldo@example.com`
- Senha: `@@Senha123`

**Funcionário:**
- Email: `neymar.junior@example.com`
- Senha: `@@Senha123`

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 👨‍💻 Autor

Desenvolvido com ❤️ por Jorge

## 🔗 Links Úteis

- [Documentação do React](https://react.dev/)
- [Documentação do Vite](https://vitejs.dev/)
- [Documentação do Material-UI](https://mui.com/)
- [Documentação do Redux Toolkit](https://redux-toolkit.js.org/)
- [Backend Repository](#) - Link para o repositório do backend

