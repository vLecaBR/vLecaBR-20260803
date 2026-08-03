import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor JWT funcional (`HttpInterceptorFn`), registrado em
 * `provideHttpClient(withInterceptors([jwtInterceptor]))`.
 *
 * Responsabilidades:
 *  - anexar `Authorization: Bearer <token>` em toda request autenticada;
 *  - tratar `401` derrubando a sessão e redirecionando para /login;
 *  - repassar `ProblemDetails` (title/detail) da API .NET como `Error` para a UI.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();

  const autenticada = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(autenticada).pipe(
    catchError((erro: HttpErrorResponse) => {
      if (erro.status === 401) {
        auth.logout();
        router.navigate(['/login']);
        return throwError(() => new Error('Sessão expirada.'));
      }
      const problem = erro.error;
      const mensagem = problem?.detail ?? problem?.title ?? 'Falha na requisição.';
      return throwError(() => new Error(mensagem));
    }),
  );
};
