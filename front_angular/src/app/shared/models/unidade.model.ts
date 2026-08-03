import type { Status } from './usuario.model';

/** Colaborador resumido, como retornado dentro de UnidadeResponse (ColaboradorResumoResponse). */
export interface ColaboradorResumo {
  id: string;
  codigo: string;
  nome: string;
}

/** Espelha o UnidadeResponse do backend (inclui os colaboradores relacionados). */
export interface Unidade {
  id: string;
  codigo: string;
  nome: string;
  status: Status;
  criadoEm: string;
  colaboradores: ColaboradorResumo[];
  /** Derivado de colaboradores.length no mapeamento do serviço. */
  totalColaboradores: number;
}

/** Criação — o backend aceita código e nome (status inicial default = Ativo). */
export interface UnidadeCreateDto {
  codigo: string;
  nome: string;
  status: Status;
}

/** Na edição apenas o nome e a ativação/inativação são permitidos. */
export interface UnidadeUpdateDto {
  nome: string;
  status: Status;
}
