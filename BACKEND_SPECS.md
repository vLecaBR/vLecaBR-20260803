# Especificações do Backend - Sistema de Gestão (C# .NET 8)

## Visão Geral
API RESTful desenvolvida em C# (.NET 8) com PostgreSQL, utilizando Entity Framework Core e autenticação JWT. O objetivo é fornecer os endpoints exatos mapeados pelo frontend (Angular) e aplicar regras de negócio estritas.

## Regras de Negócio Globais (RN)
* RN01: Todo colaborador precisa estar vinculado a um usuário existente.
* RN02: Bloquear inclusão/transferência de colaborador para unidade "Inativa".
* RN03: Não alterar Login/Código do usuário após criação (apenas Senha e Status).
* RN04: Códigos de usuário, colaborador e unidade devem ser únicos.

---

## Fases de Desenvolvimento (Executar UMA por vez, apenas sob demanda)

### Fase 1: Domain & Entidades (Herança e Core)
* **Objetivo:** Criar as entidades de domínio utilizando boas práticas de Orientação a Objetos.
* **Tarefas:**
  1. Criar classe abstrata `BaseEntity` (Id Guid, DataCriacao, DataAtualizacao).
  2. Criar `Usuario` (herdando de BaseEntity, com Código, Login, Senha Hash, Status).
  3. Criar `Unidade` (herdando de BaseEntity, Código, Nome, Status).
  4. Criar `Colaborador` (herdando de BaseEntity, Código, Nome, FK Usuario, FK Unidade).
  5. Criar Enums necessários (ex: StatusEnum Ativo/Inativo).

### Fase 2: Infraestrutura, Data e Seed
* **Objetivo:** Configurar o acesso ao banco de dados PostgreSQL.
* **Tarefas:**
  1. Configurar `ApplicationDbContext` (EF Core).
  2. Mapeamento via Fluent API (chaves, unicidade para RN04, exclusão em cascata restrita).
  3. Configurar um *Seeding* para injetar o "Usuário Master" ao subir o banco.
  4. Criar o arquivo `docker-compose.yml` para rodar o PostgreSQL localmente.

### Fase 3: Camada de Aplicação (Services e Regras de Negócio)
* **Objetivo:** Implementar os serviços que aplicam as regras (RN01 a RN04) e a lógica de senha.
* **Tarefas:**
  1. Criar `AuthService` para gerar JWT e validar BCrypt.
  2. Criar `UsuarioService`, `ColaboradorService` e `UnidadeService`.
  3. Garantir a RN02 (bloquear colaborador em unidade inativa) no `ColaboradorService`.
  4. Garantir a RN03 (proteção de edição) no `UsuarioService`.
  5. Implementar Hard Delete seguro para Colaborador e Soft Delete/Inativação para Usuário.

### Fase 4: API, Controllers e DTOs
* **Objetivo:** Expor os endpoints (MVC/Controllers) e configurar a segurança.
* **Tarefas:**
  1. Criar DTOs de Request e Response para mapear os dados de entrada/saída (evitar overposting e ocultar a senha hasheada).
  2. Criar os `Controllers` (`AuthController`, `UsuarioController`, `ColaboradorController`, `UnidadeController`).
  3. Configurar injeção de dependência (`Program.cs`), JWT Bearer Middleware e Swagger com suporte a token.

### Fase 5: Documentação e Testabilidade
* **Objetivo:** Entregar os artefatos finais para avaliação técnica.
* **Tarefas:**
  1. Gerar um arquivo JSON de Collection do Postman já configurado com as rotas.
  2. Gerar o `README.md` espetacular ensinando a rodar o Docker, rodar as migrações e rodar o projeto.