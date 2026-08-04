import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

/**
 * Rotas standalone com lazy-loading via `loadComponent`.
 * `canActivate: [authGuard]` protege toda a área logada (`/app`),
 * equivalente ao `<RequireAuth>` do protótipo React.
 */
export const APP_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard-layout.component').then((m) => m.DashboardLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'colaboradores' },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/usuarios/usuarios-page.component').then((m) => m.UsuariosPageComponent),
      },
      {
        path: 'colaboradores',
        loadComponent: () =>
          import('./features/colaboradores/colaboradores-page.component').then((m) => m.ColaboradoresPageComponent),
      },
      {
        path: 'unidades',
        loadComponent: () =>
          import('./features/unidades/unidades-page.component').then((m) => m.UnidadesPageComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'app/colaboradores' },
];
