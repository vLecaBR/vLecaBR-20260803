# Sistema de Gestão de Colaboradores e Unidades — Frontend (Angular)

Frontend do portal de avaliação técnica, construído em **Angular 20** com **Standalone Components**,
**Tailwind CSS v4** e dados **totalmente mockados** via RxJS. A interface reproduz o protótipo (console
operacional em tema escuro) e está pronta para receber a API C# / .NET 8 sem refatoração de UI — ver
[`API_INTEGRATION_MAP.md`](./API_INTEGRATION_MAP.md).

## Stack

- Angular 20 (standalone, sem NgModules) · `provideRouter` · `provideHttpClient`
- Guard funcional (`CanActivateFn`) e interceptor JWT funcional (`HttpInterceptorFn`)
- RxJS para o estado de dados (`Observable` + `async pipe`) e signals para estado de UI
- Tailwind CSS v4 (via `@tailwindcss/postcss`)

## Como rodar

```bash
npm install
npm start        # ng serve → http://localhost:4200
npm run build    # build de produção em dist/gcu
```

Login mockado: qualquer login + **senha com 4+ caracteres** autentica (ex.: `marina.ferraz` / `1234`).

## Arquitetura de pastas

```
src/app/
├─ core/                      # Serviços, guard e interceptor
│  ├─ services/               # auth, usuario, colaborador, unidade, mock-data
│  ├─ guards/auth.guard.ts    # CanActivateFn
│  └─ interceptors/jwt.interceptor.ts  # HttpInterceptorFn (anexa Bearer, trata 401)
├─ shared/                    # Reutilizáveis
│  ├─ models/                 # Interfaces / DTOs (Usuario, Colaborador, Unidade, Auth)
│  └─ components/             # Button, DataTable (+ ColumnDirective), FormField, Modal,
│                             # PageHeader, StatusBadge
├─ features/                  # Módulos de tela (lazy via loadComponent)
│  ├─ auth/                   # LoginPage
│  ├─ dashboard/              # DashboardLayout (sidebar + <router-outlet>)
│  ├─ usuarios/               # Página + modal
│  ├─ colaboradores/          # Página + modal (com busca/debounce e remoção)
│  └─ unidades/               # Página + modal (com linha expansível de equipe)
├─ app.config.ts             # Providers globais
├─ app.routes.ts             # Rotas (guarda /app com authGuard)
└─ app.component.ts          # Raiz (<router-outlet>)
```

## Decisões de arquitetura (visão sênior)

- **Standalone + lazy loading:** cada tela é carregada sob demanda com `loadComponent`, sem NgModules.
- **Services desacoplados da UI:** todo acesso a dados vive em `core/services` retornando `Observable<T>`.
  Trocar mock por `HttpClient` não toca nos componentes.
- **`async pipe` como padrão:** as listagens são fluxos declarativos (`BehaviorSubject` de filtros →
  `switchMap` → service) consumidos com `| async`; o estado efêmero de UI (modais, loading) usa signals.
- **DataTable genérico com `ColumnDirective`:** as colunas são declaradas por `<ng-template appColumn>`,
  o equivalente idiomático ao padrão de _render prop_ do React, mantendo a tabela tipada e reutilizável.
- **Guard + interceptor funcionais:** alinhados à API moderna do Angular, já plugados para o JWT real.

Ver o mapeamento completo tela → método de service → endpoint em [`API_INTEGRATION_MAP.md`](./API_INTEGRATION_MAP.md).
