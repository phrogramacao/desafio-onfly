# Onfly API

API REST para controle de despesas com autenticação JWT.

## Requisitos

- Node.js 18+
- Docker e Docker Compose (para o banco de dados)

## Configuração

### 1. Variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com as credenciais do banco e do serviço de e-mail. Para testes de e-mail, recomendo o [Ethereal](https://ethereal.email) (gratuito, sem cadastro).

### 2. Banco de dados

```bash
docker-compose up -d
```

### 3. Instalar dependências e iniciar

```bash
npm install
npm run start:dev
```

A API ficará disponível em `http://localhost:3100`.

## Endpoints

### Autenticação

| Método | URL                                    | Descrição          |
|--------|----------------------------------------|--------------------|
| POST   | http://localhost:3100/auth/register    | Cadastrar usuário  |
| POST   | http://localhost:3100/auth/login       | Autenticar usuário |

### Despesas (requer token JWT)

| Método | URL                                    | Descrição                |
|--------|----------------------------------------|--------------------------|
| POST   | http://localhost:3100/expenses         | Cadastrar despesa        |
| GET    | http://localhost:3100/expenses         | Listar minhas despesas   |
| GET    | http://localhost:3100/expenses/id     | Buscar despesa por ID    |
| PATCH  | http://localhost:3100/expenses/id     | Atualizar despesa        |
| DELETE | http://localhost:3100/expenses/id     | Remover despesa          |

Enviar o token no header: `Authorization: Bearer <token>`

### Exemplos de payload

**POST /auth/register**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

**POST /auth/login**
```json
{
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

**POST /expenses**
```json
{
  "description": "Almoço com cliente",
  "date": "2026-03-10",
  "value": 85.50
}
```

**PATCH /expenses/:id** (todos os campos são opcionais)
```json
{
  "description": "Jantar com cliente",
  "date": "2026-03-11",
  "value": 120.00
}
```

**DELETE /expenses/:id** — não requer body, apenas o token no header.

## Testes

```bash
npm run test
npm run test:cov
```
