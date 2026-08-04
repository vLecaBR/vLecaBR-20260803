export interface Credenciais {
  login: string;
  senha: string;
}

/** Resposta do backend em POST /api/auth/login (LoginResponse do C#). */
export interface LoginResponse {
  token: string;
  expiraEm: string;
  tokenType: string;
}

/** Identidade mínima da sessão. O backend não retorna perfil; guardamos o login. */
export interface UsuarioSessao {
  login: string;
}
