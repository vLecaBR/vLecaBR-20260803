# API_INTEGRATION_MAP

Mapa de integração entre o **frontend Angular 20 (mockado)** e a API **C# / .NET 8 + PostgreSQL + JWT**.

O frontend foi construído com a arquitetura oficial do Angular (Standalone Components, `provideRouter`,
`provideHttpClient`, guard e interceptor funcionais). Todos os `services` em `src/app/core/services/` já
retornam `Observable<T>` do RxJS, então a troca do mock pela API real é **mecânica**: substituir o corpo de
cada método por uma chamada `HttpClient`, sem alterar componentes nem templates.

---

## 1. Padrão de integração

Cada service hoje devolve dados em memória com `of(...).pipe(delay(500))`. A migração é sempre a mesma:

```ts
// 1) Injetar o HttpClient no service (construtor moderno):
private readonly http = inject(HttpClient);
private readonly base = API_BASE_URL; // definido em core/interceptors/jwt.interceptor.ts

// ANTES (mock)
listar(status: Status | 'TODOS' = 'TODOS'): Observable<Usuario[]> {
  const filtrados = status === 'TODOS' ? this.usuarios : this.usuarios.filter(u => u.status === status);
  return of(filtrados.map(u => ({ ...u }))).pipe(delay(500));
}

// DEPOIS (API real)
listar(status: Status | 'TODOS' = 'TODOS'): Observable<Usuario[]> {
  const params = status === 'TODOS' ? {} : { status };
  return this.http.get<Usuario[]>(`${this.base}/usuarios`, { params });
}
```

O `jwtInterceptor` (`core/interceptors/jwt.interceptor.ts`) já anexa `Authorization: Bearer <token>`,
trata `401` (logout + redirect para `/login`) e converte `ProblemDetails` do .NET em `Error`.
Ele está registrado em `app.config.ts` via `provideHttpClient(withInterceptors([jwtInterceptor]))` e passa a
atuar automaticamente assim que os services usarem `HttpClient`.

---

## 2. Tabela de integração

| Feature | Ação do usuário | Arquivo a modificar | Método / Linha | O que fazer |
|---------|-----------------|---------------------|----------------|-------------|
| Auth | Login (submit do formulário) | `core/services/auth.service.ts` | `login()` | Trocar `of(TOKEN_MOCK)` por `this.http.post<TokenResponse>('/api/auth/login', credenciais)`. Remover a validação fake (`senha.length < 4`) — o `401` passa a vir da API via interceptor. |
| Auth | Persistir sessão | `core/services/auth.service.ts` | `persistir()` / `getToken()` | Manter, ou migrar para cookie `HttpOnly` se a API emitir o token via `Set-Cookie`. |
| Auth | Sair | `features/dashboard/dashboard-layout.component.ts` | `sair()` | Opcionalmente chamar `POST /api/auth/logout` antes de `auth.logout()`. |
| Auth | Proteção de rota | `core/guards/auth.guard.ts` | `authGuard` | Validar expiração real do JWT (decodificar `exp`) em vez de apenas checar a presença do token. |
| Auth | Token em toda request | `core/interceptors/jwt.interceptor.ts` | `jwtInterceptor` / `API_BASE_URL` | Definir a base URL real (ex.: `https://api.empresa.com/v1`) e implementar refresh token no bloco `401`. |
| Usuários | Listagem / filtro de status | `core/services/usuario.service.ts` | `listar(status)` | Trocar por `GET /api/usuarios?status={status}`. Enviar `TODOS` como ausência do parâmetro. |
| Usuários | Consumir listagem na tela | `features/usuarios/usuarios-page.component.ts` | `vm$` (switchMap) | Nenhuma mudança — apenas adicionar `catchError` para exibir falha da API. |
| Usuários | Salvar cadastro | `core/services/usuario.service.ts` | `criar(dto)` | Trocar por `POST /api/usuarios` com `UsuarioCreateDto`. O `codigo` passa a vir do banco (identity). Remover `proximoCodigo`. |
| Usuários | Salvar edição (senha/status) | `core/services/usuario.service.ts` | `atualizar(codigo, dto)` | Trocar por `PUT /api/usuarios/{codigo}` com `UsuarioUpdateDto`. Enviar `senha` só quando preenchida (hash BCrypt no backend). |
| Usuários | Submit do modal | `features/usuarios/usuario-form-modal.component.ts` | `salvar()` | Substituir a validação local pela exibição de `ProblemDetails.errors` da API. |
| Colaboradores | Listagem / busca / filtro unidade | `core/services/colaborador.service.ts` | `listar(busca, unidadeCodigo)` | Trocar por `GET /api/colaboradores?busca={busca}&unidade={codigo}`. O `debounceTime(300)` já está aplicado no componente. |
| Colaboradores | Consumir listagem + debounce | `features/colaboradores/colaboradores-page.component.ts` | `colaboradores$` | Debounce já implementado; apenas tratar `error` no fluxo. |
| Colaboradores | Popular selects de Usuário/Unidade | `features/colaboradores/colaborador-form-modal.component.ts` | `usuarios$` / `unidades$` | Apontar para `GET /api/usuarios?status=ATIVO&semColaborador=true` e `GET /api/unidades`. |
| Colaboradores | Salvar cadastro | `core/services/colaborador.service.ts` | `criar(dto)` | Trocar por `POST /api/colaboradores` (`ColaboradorCreateDto`). Remover o "join" manual com os mocks — a API devolve `usuarioLogin` e `unidadeNome`. |
| Colaboradores | Salvar edição (nome/cargo/unidade) | `core/services/colaborador.service.ts` | `atualizar(codigo, dto)` | Trocar por `PUT /api/colaboradores/{codigo}` (`ColaboradorUpdateDto`). O `usuarioCodigo` não é enviado (imutável — RN01). |
| Colaboradores | Confirmar remoção | `core/services/colaborador.service.ts` | `remover(codigo)` | Trocar por `DELETE /api/colaboradores/{codigo}`. Tratar `409 Conflict` para dependências. |
| Colaboradores | Modal de confirmação | `features/colaboradores/colaboradores-page.component.ts` | `confirmarRemocao()` | Já tem bloco `error:` no `subscribe`; exibir o conflito retornado pela API. |
| Unidades | Listagem / filtro de status | `core/services/unidade.service.ts` | `listar(status)` | Trocar por `GET /api/unidades?status={status}`. O `totalColaboradores` deve vir agregado (`COUNT`) do backend. |
| Unidades | "Ver colaboradores" (expansão) | `core/services/unidade.service.ts` | `listarColaboradores(codigo)` | Trocar por `GET /api/unidades/{codigo}/colaboradores`. |
| Unidades | Expansão na tela | `features/unidades/unidades-page.component.ts` | `alternarEquipe()` | Sem mudança estrutural — considerar cache por unidade para evitar refetch. |
| Unidades | Salvar cadastro | `core/services/unidade.service.ts` | `criar(dto)` | Trocar por `POST /api/unidades` (`UnidadeCreateDto`). Tratar `409` para código duplicado (RN04). |
| Unidades | Salvar edição (nome / ativar-inativar) | `core/services/unidade.service.ts` | `atualizar(codigo, dto)` | Trocar por `PUT /api/unidades/{codigo}` (`UnidadeUpdateDto`) ou `PATCH /api/unidades/{codigo}/status`. |
| Unidades | Submit do modal | `features/unidades/unidade-form-modal.component.ts` | `salvar()` | Substituir validação local pelos erros de validação da API. |
| Global | Dados mockados em memória | `core/services/mock-data.ts` | arquivo inteiro | **Excluir** após a integração, junto com os campos `private usuarios/unidades/colaboradores` e `proximoCodigo` nos services. |

---

## 3. Contratos esperados (DTOs)

| Model TypeScript | Arquivo | DTO C# correspondente |
|------------------|---------|-----------------------|
| `Usuario`, `UsuarioCreateDto`, `UsuarioUpdateDto` | `shared/models/usuario.model.ts` | `UsuarioResponse`, `CriarUsuarioRequest`, `AtualizarUsuarioRequest` |
| `Colaborador`, `ColaboradorCreateDto`, `ColaboradorUpdateDto` | `shared/models/colaborador.model.ts` | `ColaboradorResponse`, `CriarColaboradorRequest`, `AtualizarColaboradorRequest` |
| `Unidade`, `UnidadeCreateDto`, `UnidadeUpdateDto` | `shared/models/unidade.model.ts` | `UnidadeResponse`, `CriarUnidadeRequest`, `AtualizarUnidadeRequest` |
| `Credenciais`, `TokenResponse`, `UsuarioSessao` | `shared/models/auth.model.ts` | `LoginRequest`, `TokenResponse`, `UsuarioSessaoDto` |

`Status` é a union `'ATIVO' | 'INATIVO'` — serializar o enum C# como **string** (`JsonStringEnumConverter`).

---

## 4. Regras de negócio já refletidas na UI

- **RN01 — Vínculo:** todo colaborador exige um usuário; no cadastro o select de usuário é obrigatório.
- **RN02 — Unidade inativa:** o select de unidade exibe o sufixo `(inativa)`; o bloqueio de vínculo é
  responsabilidade do backend e o `409`/validação deve ser exibido no modal.
- **RN03 — Proteção de usuário:** `login` e `codigo` são `readonly` na edição; apenas `senha` (opcional) e
  `status` são enviados.
- **RN04 — Unicidade:** códigos são chave; tratar `409 Conflict` no cadastro de usuário/colaborador/unidade.
- **Colaborador:** `usuarioCodigo` é imutável na edição (campo bloqueado exibindo o login).
- **Unidade:** `codigo` e `cidade` são `readonly` na edição; apenas `nome` e `status` são enviados.

---

## 5. Onde cada peça da arquitetura Angular vive

| Camada | Caminho | Conteúdo |
|--------|---------|----------|
| Bootstrap | `src/main.ts`, `src/app/app.config.ts` | `bootstrapApplication` + providers (router, HttpClient + interceptor) |
| Rotas | `src/app/app.routes.ts` | `Routes[]` com `loadComponent` (lazy) e `canActivate: [authGuard]` |
| Core · Services | `src/app/core/services/*` | Regras de acesso a dados (mock → HttpClient) |
| Core · Guard | `src/app/core/guards/auth.guard.ts` | `CanActivateFn` |
| Core · Interceptor | `src/app/core/interceptors/jwt.interceptor.ts` | `HttpInterceptorFn` |
| Shared · Models | `src/app/shared/models/*` | Interfaces / DTOs |
| Shared · Components | `src/app/shared/components/*` | Button, DataTable (+ `ColumnDirective`), FormField, Modal, PageHeader, StatusBadge |
| Features | `src/app/features/*` | Auth, Dashboard (layout + `<router-outlet>`), Usuarios, Colaboradores, Unidades |
