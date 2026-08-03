# 🏢 Sistema de Gestão de Colaboradores e Unidades — Backend

API RESTful em **C# / .NET 8** para gestão de Usuários, Unidades e Colaboradores, construída com arquitetura em camadas (Domain-Driven), PostgreSQL, Entity Framework Core e autenticação JWT.

> Desenvolvida em **Spec-Driven Development**, seguindo rigorosamente o `BACKEND_SPECS.md` e aplicando as regras de negócio RN01 a RN04.

---

## 📑 Sumário

- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Diferenciais Implementados](#-diferenciais-implementados)
- [Regras de Negócio](#-regras-de-negócio-rn)
- [Passo a Passo — Como Rodar](#-passo-a-passo--como-rodar)
- [Credenciais do Usuário Master](#-credenciais-do-usuário-master-seed)
- [Endpoints](#-endpoints)
- [Testes via Postman](#-testes-via-postman)

---

## 🚀 Tecnologias

| Categoria | Stack |
|-----------|-------|
| Linguagem / Runtime | C# 12 · .NET 8 |
| Persistência | PostgreSQL 16 · Entity Framework Core 8 (Npgsql) |
| Segurança | JWT Bearer · BCrypt.Net-Next |
| Documentação | Swagger / OpenAPI (Swashbuckle) |
| Infraestrutura | Docker Compose |
| Testes de API | Postman Collection v2.1 |

---

## 🏛 Arquitetura

Solução em **4 projetos** com dependências unidirecionais (fluxo de dependência sempre apontando para o domínio):

Repositório organizado como **monorepo**: backend .NET em `backend/` e frontend Angular em `front_angular/`.

```
projeto_rodonaves/
├── backend/
│   ├── GestaoColaboradores.sln
│   └── src/
│       ├── GestaoColaboradores.Domain          → Entidades ricas, Enums, BaseEntity (sem dependências)
│       ├── GestaoColaboradores.Infrastructure  → DbContext, IEntityTypeConfiguration, Seed
│       ├── GestaoColaboradores.Application      → Interfaces, Services, regras de negócio, JWT/BCrypt
│       └── GestaoColaboradores.Api              → Controllers, DTOs, Middleware, Program.cs
├── front_angular/                              → SPA Angular
├── postman/                                    → Collection de testes
└── docker-compose.yml                          → PostgreSQL local
```

- **Domain-Driven / Modelo Rico:** as entidades encapsulam seu estado (setters privados) e só mudam via métodos de comportamento (`Inativar()`, `AlterarSenha()`, `TransferirPara()`). Estado inválido é impossível de construir.
- **MVC isolado:** os Controllers são finos — apenas orquestram serviços e mapeiam DTOs, sem lógica de negócio.
- **DIP (SOLID):** cada serviço tem interface (`IAuthService`, `IUsuarioService`, etc.), resolvidas por injeção de dependência.

---

## ✨ Diferenciais Implementados

- **Modelo de Domínio Rico** com `BaseEntity` abstrata (DRY) centralizando `Id`, `DataCriacao` e `DataAtualizacao`.
- **EF Core Fluent API** isolada em classes `IEntityTypeConfiguration<T>` (uma por entidade), com índices únicos (`IsUnique`) e `DeleteBehavior.Restrict`.
- **Seed determinístico** do Usuário Master com **hash BCrypt real** — o primeiro login já funciona.
- **Hashing seguro de senhas** com BCrypt (work factor 11); o hash **nunca** é exposto no JSON de resposta.
- **Estratégias de exclusão distintas:** *Hard Delete* para Colaborador (`Remove()`) e *Soft Delete* para Usuário (`Inativar()`).
- **Features do .NET 8:** `IExceptionHandler` para tratamento global de erros retornando `ProblemDetails` (sem vazar stack trace), records para DTOs, primary constructors.
- **Swagger com botão "Authorize"** — cole o Bearer token e teste tudo pelo navegador.
- **Migração automática** (`Database.Migrate()`) na subida da API — sobe o schema e o seed sem passos manuais.
- **Testes unitários (xUnit + FluentAssertions)** cobrindo as regras RN01–RN04, soft/hard delete e o filtro por status.
- **Containerização completa** — `Dockerfile` multi-stage da API + `docker-compose` que sobe banco **e** API juntos.

---

## 📋 Regras de Negócio (RN)

| Regra | Descrição | Onde é aplicada |
|-------|-----------|-----------------|
| **RN01** | Colaborador precisa estar vinculado a um usuário existente | `ColaboradorService` + construtor da entidade |
| **RN02** | Bloquear inclusão/transferência de colaborador para unidade **Inativa** | `ColaboradorService` + guarda de domínio `Colaborador` |
| **RN03** | Não alterar Login/Código do usuário após criação (apenas Senha e Status) | Garantido por construção — a entidade não expõe esses setters |
| **RN04** | Códigos de usuário, colaborador e unidade devem ser únicos | Índices únicos (Fluent API) + validação prévia no serviço |

---

## 🛠 Passo a Passo — Como Rodar

### Pré-requisitos
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Docker](https://www.docker.com/) + Docker Compose

### 1️⃣ Suba a infraestrutura (Docker)

Na raiz do projeto, você tem duas opções:

```bash
# Opção A — subir SÓ o banco (para rodar a API localmente via dotnet no passo 2)
docker compose up -d postgres

# Opção B — subir banco + API já containerizada (build automático da imagem)
docker compose up -d --build
```

O PostgreSQL 16 sobe na porta `5432` (banco `gestao_colaboradores`, usuário `gestao` / senha `gestao123`), com `healthcheck` e volume persistente. Na Opção B, a API sobe em `http://localhost:5080` e só inicia após o banco ficar saudável.

> Usando a Opção B, você pode pular o passo 2 e ir direto ao Swagger.

### 2️⃣ Rode a API (.NET)

> Todos os comandos .NET abaixo assumem que você está **dentro da pasta `backend/`**.

```bash
# A partir da raiz do projeto, entre na pasta do backend
cd backend

# Restaurar dependências
dotnet restore

# (Opcional) Se preferir aplicar as migrations manualmente:
dotnet ef database update --project src/GestaoColaboradores.Infrastructure --startup-project src/GestaoColaboradores.Api

# Rodar a API — as migrations pendentes (e o Seed do Master) são aplicadas automaticamente na subida
dotnet run --project src/GestaoColaboradores.Api
```

> Se ainda não existir a migração inicial, gere-a uma única vez (também de dentro de `backend/`):
> ```bash
> dotnet ef migrations add InitialCreate --project src/GestaoColaboradores.Infrastructure --startup-project src/GestaoColaboradores.Api
> ```

A API sobe em **http://localhost:5080** e o Swagger fica em:

```
http://localhost:5080/swagger
```

### 3️⃣ Rode o Frontend (Angular)

Em outro terminal, a partir de `front_angular/`:

```bash
cd front_angular
npm install
npm start   # ng serve — sobe em http://localhost:4200
```

O frontend consome a API real (`http://localhost:5080/api`, configurado em `src/environments/environment.ts`). O backend já libera CORS para `http://localhost:4200`. Faça login com o Usuário Master; o token JWT é salvo no `localStorage` e anexado automaticamente pelo interceptor em todas as requisições.

### 4️⃣ Faça o primeiro acesso

Use as credenciais do Usuário Master (criadas automaticamente pelo Seed) na tela de login do portal, ou direto na rota `POST /api/auth/login`.

---

## 🔑 Credenciais do Usuário Master (Seed)

| Campo | Valor |
|-------|-------|
| **Login** | `master` |
| **Senha** | `Master@123` |

No Swagger: faça o login, copie o `token` retornado, clique em **Authorize** (cadeado 🔒), cole `Bearer <token>` e teste as rotas protegidas.

---

## 🌐 Endpoints

Base: `http://localhost:5080`

### Auth
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/auth/login` | Autentica e retorna JWT | 🔓 Pública |

### Usuários
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/usuarios` | Lista usuários (filtro opcional `?status=Ativo` \| `Inativo`) |
| GET | `/api/usuarios/{id}` | Obtém por Id |
| POST | `/api/usuarios` | Cria usuário |
| PUT | `/api/usuarios/{id}/senha` | Altera senha (RN03) |
| PATCH | `/api/usuarios/{id}/ativar` | Ativa usuário |
| DELETE | `/api/usuarios/{id}` | Inativa (Soft Delete) |

### Unidades
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/unidades` | Lista unidades **com os colaboradores relacionados** |
| GET | `/api/unidades/{id}` | Obtém por Id (com colaboradores) |
| POST | `/api/unidades` | Cria unidade |
| PUT | `/api/unidades/{id}` | Atualiza nome |
| PATCH | `/api/unidades/{id}/ativar` | Ativa unidade |
| DELETE | `/api/unidades/{id}` | Inativa unidade |

### Colaboradores
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/colaboradores` | Lista colaboradores |
| GET | `/api/colaboradores/{id}` | Obtém por Id |
| POST | `/api/colaboradores` | Cria (RN01/RN02) |
| PUT | `/api/colaboradores/{id}` | Atualiza nome |
| PATCH | `/api/colaboradores/{id}/transferir` | Transfere de unidade (RN02) |
| DELETE | `/api/colaboradores/{id}` | Exclui (Hard Delete) |

> Todas as rotas, exceto o login, exigem `Authorization: Bearer <token>`.

---

## 🧪 Testes Automatizados

Testes unitários dos serviços (xUnit + FluentAssertions + EF Core InMemory), cobrindo as regras de negócio. De dentro da pasta `backend/`:

```bash
dotnet test
```

Cobertura dos cenários principais: vínculo válido de colaborador, RN01 (usuário inexistente), RN02 (unidade inativa na criação e na transferência), RN04 (código/login duplicados), Soft Delete de usuário, Hard Delete de colaborador, filtro por status e hashing/troca de senha com BCrypt.

---

## 📮 Testes via Postman

A Collection pronta está em:

```
postman/GestaoColaboradores.postman_collection.json
```

Passos:

1. No Postman: **Import** → selecione o arquivo acima.
2. A collection já traz as variáveis `{{base_url}}` (`http://localhost:5080`) e `{{token}}`.
3. Execute **Auth › Login (Master)**. Um script na aba *Tests* **captura o token automaticamente** e o grava em `{{token}}`.
4. Todas as demais requisições herdam a autenticação Bearer da collection — basta dispará-las, sem colar token manualmente.

---

## 📄 Licença

Projeto desenvolvido para avaliação técnica.
