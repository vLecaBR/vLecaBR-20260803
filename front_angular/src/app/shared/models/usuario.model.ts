/** Espelha o StatusEnum do backend, serializado como string ("Ativo" | "Inativo"). */
export type Status = 'Ativo' | 'Inativo';

/** Espelha o UsuarioResponse do backend (identificado por Guid). */
export interface Usuario {
  id: string;
  codigo: string;
  login: string;
  status: Status;
  criadoEm: string;
}

/** Payload de criação. O backend exige código único, login e senha (mín. 6). */
export interface UsuarioCreateDto {
  codigo: string;
  login: string;
  senha: string;
  status: Status;
}

/**
 * Payload de edição — apenas senha e status são editáveis (RN03).
 * `senha` é opcional (vazio = manter a atual).
 */
export interface UsuarioUpdateDto {
  senha?: string;
  status: Status;
}
