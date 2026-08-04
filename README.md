# 🏢 Sistema de Gestão de Colaboradores e Unidades

Aplicação **full-stack** para gestão de Usuários, Unidades e Colaboradores, composta por uma **API RESTful em C# / .NET 8** (PostgreSQL, EF Core, JWT) e um **portal em Angular 20** que consome essa API. Todo o ambiente sobe via **Docker**.

> Projeto de avaliação técnica, desenvolvido em **Spec-Driven Development** e aplicando rigorosamente as regras de negócio RN01 a RN04.

---

## 📑 Sumário

- [Visão Geral](#-visão-geral)
- [Tecnologias](#-tecnologias)
- [Estrutura do Monorepo](#-estrutura-do-monorepo)
- [Arquitetura](#-arquitetura)
- [Funcionalidades do Portal](#-funcionalidades-do-portal)
- [Regras de Negócio](#-regras-de-negócio-rn)
- [Diferenciais Implementados](#-diferenciais-implementados)
- [Como Rodar](#-como-rodar)
- [Credenciais do Usuário Master](#-credenciais-do-usuário-master-seed)
- [Endpoints da API](#-endpoints-da-api)
- [Testes Automatizados](#-testes-automatizados)
- [Testes via Postman](#-testes-via-postman)
- [Conformidade com o Desafio](#-conformidade-com-o-desafio)

---

## 🔎 Visão Geral

O sistema permite cadastrar e administrar **usuários de acesso**, **unidades organizacionais** e **colaboradores** vinculados a um usuário e a uma unidade. O acesso é protegido por **autenticação JWT (Bearer token)**, e o portal oferece todas as operações de CRUD com feedback visual (notificações), filtros e validação de regras de negócio ponta a ponta.

Dois processos compõem a aplicação em desenvolvimento:

| Serviço | Porta | Descrição |
|---|---|---|
| API (.NET 8) | `5080` | Backend REST + Swagger |
| Portal (Angular) | `4200` | Frontend SPA |
| PostgreSQL | `5432` | Banco de dados (via Docker) |

---

## 🚀 Tecnologias

**Backend**

| Categoria | Stack |
|---|---|
| Linguagem / Runtime | C# 12 · .NET 8 |
| Persistência | PostgreSQL 16 · Entity Framework Core 8 (Npgsql) |
| Segurança | JWT Bearer · BCrypt.Net-Next |
| Documentação | Swagger / OpenAPI (Swashbuckle) |
| Testes | xUnit · FluentAssertions · EF Core InMemory |

**Frontend**

| Categoria | Stack |
|---|---|
| Framework | Angular 20 (standalone components, signals) |
| HTTP / Estado | HttpClient · RxJS · Angular Signals |
| Estilo | Tailwind CSS 4 |
| Segurança | Interceptor JWT · Route Guard com validação de expiração |

**Infraestrutura**

| Categoria | Stack |
|---|---|
| Contêineres | Docker · Docker Compose |
| Testes de API | Postman Collection v2.1 |

---

## 📂 Estrutura do Monorepo

```
projeto_rodonaves/
├── backend/
│   ├── GestaoColaboradores.sln
│   ├── Dockerfile                      → build multi-stage da API
│   ├── src/
│   │   ├── GestaoColaboradores.Domain          → Entidades ricas, Enums, BaseEntity (sem dependências)
│   │   ├── GestaoColaboradores.Infrastructure  → DbContext, IEntityTypeConfiguration, Seed, Migrations
│   │   ├── GestaoColaboradores.Application      → Interfaces, Services, regras de negócio, JWT/BCrypt
│   │   └── GestaoColaboradores.Api              → Controllers, DTOs, Middleware, Program.cs
│   └── tests/
│       └── GestaoColaboradores.Tests           → Testes unitários (xUnit)
├── frontend/
│   └── src/app/
│       ├── core/          → services (HttpClient), interceptor JWT, guard, toasts
│       ├── shared/        → models, componentes reutilizáveis (tabela, modal, toast…)
│       └── features/      → auth, dashboard, usuarios, colaboradores, unidades
├── postman/               → Collection de testes com auto-injeção de token
├── docker-compose.yml     → PostgreSQL + API
└── README.md
```

---

## 🏛 Arquitetura

### Backend — camadas com dependência unidirecional (apontando para o domínio)

- **Domain-Driven / Modelo Rico:** as entidades encapsulam o estado (setters privados) e só mudam via métodos de comportamento (`Inativar()`, `AlterarSenha()`, `TransferirPara()`). Estado inválido é impossível de construir.
- **MVC isolado:** os Controllers são finos — apenas orquestram serviços e mapeiam DTOs, sem lógica de negócio.
- **DIP (SOLID):** cada serviço tem interface (`IAuthService`, `IUsuarioService`, `IUnidadeService`, `IColaboradorService`), resolvidas por injeção de dependência.
- **Herança (DRY):** `BaseEntity` abstrata centraliza `Id`, `DataCriacao` e `DataAtualizacao`.

### Frontend — Angular standalone + signals

- **Componentes standalone** com lazy-loading por rota (`loadComponent`).
- **Camada `core`:** um serviço por recurso, cada um mapeando 1:1 com os endpoints da API via `HttpClient`.
- **Interceptor JWT:** anexa `Authorization: Bearer <token>` em toda requisição, trata `401` encerrando a sessão e traduz o `ProblemDetails` da API em mensagem amigável.
- **Route Guard:** protege a área logada e **valida a expiração** do JWT (decodifica o claim `exp`), não só a presença do token.
- **Feedback ao usuário:** serviço de **toasts** (notificações) para sucesso/erro em todas as operações.

---

## 🖥 Funcionalidades do Portal

- **Autenticação** — tela de login que obtém e persiste o token JWT; sessão de 60 minutos.
- **Usuários** — cadastro (código, login, senha, status), edição de **senha e status** (login/código imutáveis), listagem com **filtro por status**.
- **Unidades** — cadastro (código único, nome), ativação/inativação, listagem com **expansão dos colaboradores relacionados**.
- **Colaboradores** — cadastro (código, nome, usuário e unidade), edição de nome e **transferência de unidade**, remoção, busca por nome/login e filtro por unidade.
- **Regras de negócio ativas na UI** — mensagens claras quando se tenta, por exemplo, vincular um colaborador a uma unidade inativa (RN02) ou usar um código já existente (RN04).

---

## 📋 Regras de Negócio (RN)

| Regra | Descrição | Onde é aplicada |
|---|---|---|
| **RN01** | Colaborador precisa estar vinculado a um usuário existente | `ColaboradorService` + construtor da entidade |
| **RN02** | Bloquear inclusão/transferência de colaborador para unidade **Inativa** | `ColaboradorService` + guarda de domínio `Colaborador` |
| **RN03** | Não alterar Login/Código do usuário após criação (apenas Senha e Status) | Garantido por construção — a entidade não expõe esses setters |
| **RN04** | Códigos de usuário, colaborador e unidade devem ser únicos | Índices únicos (Fluent API) + validação prévia no serviço |

---

## ✨ Diferenciais Implementados

**Backend**

- Modelo de Domínio Rico com `BaseEntity` abstrata (herança + DRY).
- EF Core **Fluent API** isolada em `IEntityTypeConfiguration<T>`, com índices únicos (`IsUnique`) e `DeleteBehavior.Restrict`.
- **Seed determinístico** do Usuário Master com **hash BCrypt real** — o primeiro login já funciona.
- Senhas com **BCrypt** (work factor 11); o hash **nunca** é exposto no JSON.
- **Hard Delete** para Colaborador e **Soft Delete** (inativação) para Usuário.
- **`IExceptionHandler` (.NET 8)** com `ProblemDetails` — sem vazar stack trace.
- **CORS** liberado para o portal Angular (`localhost:4200`).
- **Swagger com botão Authorize**, **migração automática** na subida e **HTTPS redirect** condicional (silencioso em container).
- **Testes unitários (xUnit + FluentAssertions)** das regras RN01–RN04, soft/hard delete e filtro por status.
- **Containerização completa** — Dockerfile multi-stage + `docker-compose` subindo banco **e** API.

**Frontend**

- **Notificações (toasts)** de sucesso e erro em todas as ações.
- **Guard com validação de expiração do JWT**.
- Serviços tipados batendo 1:1 com os DTOs do backend.
- Design system próprio (Tailwind), componentes reutilizáveis e estados de carregamento/vazio.

---

## 🛠 Como Rodar

### Pré-requisitos

- [Docker](https://www.docker.com/) + Docker Compose
- [Node.js 20+](https://nodejs.org/) (para o frontend)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) — **opcional**, apenas para rodar/testar a API fora do Docker

### 1️⃣ Subir banco + API (Docker)

Na raiz do projeto:

```bash
docker compose up -d --build
```

Isso sobe o **PostgreSQL 16** (porta `5432`, banco `gestao_colaboradores`, usuário `gestao` / senha `gestao123`) e a **API** em `http://localhost:5080`, que só inicia após o banco ficar saudável. Na subida, a API aplica as migrations automaticamente (`Database.Migrate()`), criando o schema e o **Usuário Master** do seed.

Confira em `http://localhost:5080/swagger`.

> Para subir apenas o banco (e rodar a API localmente com `dotnet run`): `docker compose up -d postgres`.

### 2️⃣ Subir o Portal (Angular)

Em outro terminal:

```bash
cd frontend
npm install
npm start        # ng serve — http://localhost:4200
```

O portal consome a API em `http://localhost:5080/api` (configurado em `src/environments/environment.ts`). O CORS do backend já libera `http://localhost:4200`.

### 3️⃣ Acessar

Abra `http://localhost:4200` e entre com as credenciais do Usuário Master. O token é salvo no `localStorage` e anexado automaticamente pelo interceptor.

> **Rodando a API fora do Docker?** De dentro de `backend/`: `dotnet restore` e `dotnet run --project src/GestaoColaboradores.Api`. Se precisar (re)gerar a migration inicial: `dotnet ef migrations add InitialCreate --project src/GestaoColaboradores.Infrastructure --startup-project src/GestaoColaboradores.Api`.

---

## 🔑 Credenciais do Usuário Master (Seed)

| Campo | Valor |
|---|---|
| **Login** | `master` |
| **Senha** | `Master@123` |

No Swagger: faça o login, copie o `token`, clique em **Authorize** 🔒, cole `Bearer <token>` e teste as rotas protegidas.

---

## 🌐 Endpoints da API

Base: `http://localhost:5080`

### Auth
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Autentica e retorna JWT | 🔓 Pública |

### Usuários
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/usuarios` | Lista usuários (filtro opcional `?status=Ativo` \| `Inativo`) |
| GET | `/api/usuarios/{id}` | Obtém por Id |
| POST | `/api/usuarios` | Cria usuário |
| PUT | `/api/usuarios/{id}/senha` | Altera senha (RN03) |
| PATCH | `/api/usuarios/{id}/ativar` | Ativa usuário |
| DELETE | `/api/usuarios/{id}` | Inativa (Soft Delete) |

### Unidades
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/unidades` | Lista unidades **com os colaboradores relacionados** |
| GET | `/api/unidades/{id}` | Obtém por Id (com colaboradores) |
| POST | `/api/unidades` | Cria unidade |
| PUT | `/api/unidades/{id}` | Atualiza nome |
| PATCH | `/api/unidades/{id}/ativar` | Ativa unidade |
| DELETE | `/api/unidades/{id}` | Inativa unidade |

### Colaboradores
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/colaboradores` | Lista colaboradores |
| GET | `/api/colaboradores/{id}` | Obtém por Id |
| POST | `/api/colaboradores` | Cria (RN01/RN02) |
| PUT | `/api/colaboradores/{id}` | Atualiza nome |
| PATCH | `/api/colaboradores/{id}/transferir` | Transfere de unidade (RN02) |
| DELETE | `/api/colaboradores/{id}` | Exclui (Hard Delete) |

> Todas as rotas, exceto o login, exigem `Authorization: Bearer <token>`.

---

## 🧪 Testes Automatizados

Testes unitários dos serviços (xUnit + FluentAssertions + EF Core InMemory). De dentro de `backend/`:

```bash
dotnet test
```

Cobrem: vínculo válido de colaborador, RN01 (usuário inexistente), RN02 (unidade inativa na criação e na transferência), RN04 (código/login duplicados), Soft Delete de usuário, Hard Delete de colaborador, filtro por status e hashing/troca de senha com BCrypt.

---

## 📮 Testes via Postman

Collection pronta em `postman/GestaoColaboradores.postman_collection.json`.

1. No Postman: **Import** → selecione o arquivo.
2. A collection já traz as variáveis `{{base_url}}` (`http://localhost:5080`) e `{{token}}`.
3. Execute **Auth › Login (Master)** — um script na aba *Tests* **captura o token automaticamente** e o grava em `{{token}}`.
4. As demais requisições herdam a autenticação Bearer da collection — basta dispará-las.

---

## ✅ Conformidade com o Desafio

| Requisito | Status |
|---|---|
| Backend em C# | ✅ .NET 8, arquitetura em camadas |
| Frontend em Angular | ✅ Portal completo integrado à API |
| Banco PostgreSQL | ✅ EF Core + Npgsql |
| CRUD de Usuários (+ consulta por status) | ✅ |
| CRUD de Colaboradores (vínculo com usuário e unidade) | ✅ |
| CRUD de Unidades (+ colaboradores relacionados) | ✅ |
| Inativar unidade bloqueia novos colaboradores (RN02) | ✅ |
| Docker para o banco | ✅ (e também para a API) |
| Autenticação Bearer token | ✅ JWT + BCrypt |
| Arquitetura MVC | ✅ |
| Pattern de herança | ✅ `BaseEntity` |
| Portal com todas as funcionalidades | ✅ |
| Testes via Postman | ✅ Collection v2.1 |

---

## 📄 Licença

Projeto desenvolvido para avaliação técnica.
