import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { APP_ROUTES } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

/**
 * Providers globais da aplicação (substitui os módulos NgModule do Angular legado).
 *
 * `provideHttpClient(withInterceptors([jwtInterceptor]))` já deixa o HttpClient e o
 * interceptor JWT prontos — quando a API .NET entrar, os services trocam `of(...)`
 * por `http.get/post/...` e o token passa a ser anexado automaticamente.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(APP_ROUTES, withComponentInputBinding()),
    provideHttpClient(withInterceptors([jwtInterceptor])),
  ],
};
