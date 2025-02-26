# Quiz App

Uma aplicação de quiz interativo inspirada no Kahoot, desenvolvida com tecnologias modernas.

## Tecnologias Utilizadas

### Backend
- Node.js com TypeScript
- Express
- Prisma (ORM)
- PostgreSQL
- Socket.IO para comunicação em tempo real
- JWT para autenticação

### Frontend (Em desenvolvimento)
- React com TypeScript
- Vite
- TailwindCSS
- Socket.IO Client

## Pré-requisitos

- Node.js >= 14
- PostgreSQL >= 12
- Docker (opcional)

## Configuração do Ambiente

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd quiz-app
```

2. Instale as dependências do backend:
```bash
cd backend
npm install
```

3. Configure as variáveis de ambiente:
- Copie o arquivo `.env.example` para `.env`
- Ajuste as variáveis conforme necessário

4. Inicie o banco de dados PostgreSQL:
```bash
docker-compose up -d
```

5. Execute as migrações do banco de dados:
```bash
npm run prisma:migrate
```

6. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Estrutura do Projeto

```
backend/
├── src/
│   ├── controllers/    # Controladores da aplicação
│   ├── middlewares/    # Middlewares do Express
│   ├── routes/         # Rotas da API
│   ├── utils/          # Utilitários
│   └── server.ts       # Arquivo principal
├── prisma/
│   └── schema.prisma   # Schema do banco de dados
└── package.json
```

## API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/me` - Perfil do usuário

### Quiz
- `POST /api/quiz` - Criar quiz
- `GET /api/quiz` - Listar quizzes
- `GET /api/quiz/:id` - Obter quiz por ID
- `PUT /api/quiz/:id` - Atualizar quiz
- `DELETE /api/quiz/:id` - Deletar quiz

### Jogo
- `POST /api/game/sessions` - Criar sessão
- `GET /api/game/sessions/:code` - Obter sessão
- `POST /api/game/sessions/:code/join` - Entrar na sessão
- `POST /api/game/sessions/:code/start` - Iniciar sessão
- `POST /api/game/sessions/:code/answer` - Enviar resposta
- `POST /api/game/sessions/:code/end` - Finalizar sessão

## Contribuição

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 