import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard funcional (`CanActivateFn`) — protege a área logada.
 * Registrado nas rotas via `canActivate: [authGuard]`.
 *
 * INTEGRAÇÃO: validar a expiração real do JWT (decodificar `exp`) em vez de
 * apenas checar a presença do token.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAutenticado()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
