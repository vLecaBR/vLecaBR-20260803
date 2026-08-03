import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Credenciais, LoginResponse, UsuarioSessao } from '../../shared/models';

const TOKEN_KEY = 'gcu.access_token';
const USER_KEY = 'gcu.usuario';

/**
 * Serviço de autenticação — integra com a API .NET.
 * Persiste o token JWT no localStorage; o jwt.interceptor o anexa nas próximas requisições.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  /** POST /api/auth/login */
  login(credenciais: Credenciais): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/auth/login`, credenciais);
  }

  /** Persiste o token e o login autenticado. */
  persistir(resposta: LoginResponse, login: string): void {
    localStorage.setItem(TOKEN_KEY, resposta.token);
    localStorage.setItem(USER_KEY, JSON.stringify({ login } satisfies UsuarioSessao));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAutenticado(): boolean {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  }

  usuarioLogado(): UsuarioSessao | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UsuarioSessao) : null;
  }
}
