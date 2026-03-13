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

Edite o `.env` com as credenciais do banco e do serviço de e-mail. Para testes de e-mail, recomendo o [Mailtrap](https://mailtrap.io).

### 2. Banco de dados

```bash
docker-compose up -d
```

### 3. Instalar dependências e iniciar

```bash
npm install
npm run start:dev
```

A API ficará disponível em `http://localhost:3000`.

## Endpoints

### Autenticação

| Método | Rota             | Descrição          |
|--------|------------------|--------------------|
| POST   | /auth/register   | Cadastrar usuário  |
| POST   | /auth/login      | Autenticar usuário |

### Despesas (requer token JWT)

| Método | Rota            | Descrição                |
|--------|-----------------|--------------------------|
| POST   | /expenses       | Cadastrar despesa        |
| GET    | /expenses       | Listar minhas despesas   |
| GET    | /expenses/:id   | Buscar despesa por ID    |
| PATCH  | /expenses/:id   | Atualizar despesa        |
| DELETE | /expenses/:id   | Remover despesa          |

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

## Testes

```bash
npm run test
npm run test:cov
```
