# Contexto do Projeto: Sistema de Gestão de Colaboradores e Unidades

Você atuará como um Desenvolvedor Full Stack Sênior. Preciso da sua ajuda para construir um projeto de avaliação técnica do zero. Já fizemos o levantamento de requisitos, definimos as regras de negócio e tomamos as decisões arquiteturais. Seu objetivo agora é dar continuidade ao desenvolvimento técnico (modelagem de dados e arquitetura do código).

Abaixo está todo o escopo do projeto e as diretrizes já definidas. 

---

## 1. Escopo Técnico Exigido (Stack)
* **Backend:** C# (ASP.NET Core Web API).
* **Frontend:** Angular.
* **Banco de Dados:** PostgreSQL (via Docker).
* **Arquitetura:** Padrão MVC e aplicação clara do pattern de Herança.
* **Autenticação:** JWT (Bearer token).

## 2. Requisitos Funcionais (RF)
* **RF01 - Autenticação:** O sistema deve permitir login gerando um Bearer Token (JWT) para acesso às rotas protegidas.
* **RF02 - Gestão de Usuários:**
  * Cadastrar usuário (Código único, Login, Senha, Status Ativo/Inativo).
  * Atualizar usuário (Restrito apenas a Senha e Status).
  * Listar todos os usuários (Exibindo Login e Status).
  * Filtrar usuários por Status.
* **RF03 - Gestão de Colaboradores:**
  * Cadastrar colaborador (Código único, Nome, vinculado a uma Unidade e a um Usuário).
  * Atualizar colaborador (Nome e Unidade).
  * Remover colaborador (Exclusão do sistema).
  * Listar colaboradores (Exibindo Código, Nome e Unidade).
* **RF04 - Gestão de Unidades:**
  * Cadastrar unidade (ID único, Código de Unidade único, Nome).
  * Atualizar status da unidade (Ativar/Inativar).
  * Listar unidades (Exibindo dados da unidade e a lista de colaboradores vinculados a ela).

## 3. Regras de Negócio (RN)
* **RN01 - Vínculo:** Todo colaborador precisa obrigatoriamente estar vinculado a um usuário existente.
* **RN02 - Unidade Inativa:** O sistema bloqueará a inclusão ou transferência de um colaborador para uma unidade que esteja com o status "Inativa".
* **RN03 - Proteção de Usuário:** Não é permitido alterar o Login ou o Código de um usuário após a sua criação, apenas Senha e Status.
* **RN04 - Unicidade:** Códigos de usuário, códigos de colaborador e códigos de unidade devem ser únicos no banco de dados.

## 4. Diferenciais e Estratégias Adotadas (Visão Sênior)
* **Herança (Obrigatório):** Vamos criar uma classe abstrata `BaseEntity` (com Id, DataCriacao, DataAtualizacao). As classes Usuario, Colaborador e Unidade herdarão dela, demonstrando domínio de DRY.
* **Padrão MVC no Contexto SPA:** O "C" (Controllers) e "M" (Models) ficarão na API em C#, e o "V" (Views) será o frontend em Angular.
* **Segurança:** As senhas dos usuários não serão salvas em texto puro. Vamos utilizar BCrypt (ou ferramenta nativa do Identity) no C# para o hash das senhas.
* **Testabilidade:** A API será totalmente documentada via Swagger e disponibilizaremos uma collection do Postman no final.

## 5. Decisões de Negócio Adotadas (Alinhamento Prévio)
1. **Fluxo de Criação (Usuário e Colaborador):** Os domínios serão separados. O frontend primeiro consome o endpoint de criação de Usuário e, com o ID retornado, consome o endpoint de criação de Colaborador.
2. **Exclusão de Colaborador:** Ao remover um Colaborador, executaremos o Hard Delete nele (exclui do banco de dados). O Usuário atrelado a ele, no entanto, será apenas INATIVADO (para mantermos integridade de histórico e segurança).
3. **Usuário Master (Primeiro Acesso):** Criaremos um *Seeding* automático no C# (Entity Framework Core) para injetar um Usuário Master no banco de dados. Sem isso, não conseguiríamos gerar o primeiro JWT para testar a aplicação.

---

## O que preciso que você faça agora:

Com base em todo esse contexto, por favor, me entregue:

1. **A Modelagem do Banco de Dados:** Quais serão as entidades, seus campos (com os tipos) e como elas se relacionam (1:1, 1:N). Pode explicar de forma textual ou gerar um script SQL / diagrama em formato texto.
2. **Esqueleto da Arquitetura C#:** Como vamos dividir as pastas do projeto backend (ex: Domain, Application, Infrastructure, API)? Me dê a estrutura de pastas sugerida.
3. **Código da Classe BaseEntity:** Mostre como ficará a implementação do requisito obrigatório de herança.