/** Espelha o ColaboradorResponse do backend (identificado por Guid). */
export interface Colaborador {
  id: string;
  codigo: string;
  nome: string;
  usuarioId: string;
  usuarioLogin: string;
  unidadeId: string;
  unidadeNome: string;
  criadoEm: string;
}

/** Criação — vínculo obrigatório com usuário (RN01) e unidade ativa (RN02). */
export interface ColaboradorCreateDto {
  codigo: string;
  nome: string;
  usuarioId: string;
  unidadeId: string;
}

/**
 * Edição — o usuário vinculado é imutável (RN01). Nome é atualizado direto;
 * a troca de unidade usa o endpoint de transferência (respeitando a RN02).
 */
export interface ColaboradorUpdateDto {
  nome: string;
  unidadeId: string;
}
