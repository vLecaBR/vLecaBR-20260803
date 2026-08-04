import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { concatMap, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Colaborador, ColaboradorCreateDto, ColaboradorUpdateDto } from '../../shared/models';

/** Formato bruto retornado pelo backend (ColaboradorResponse). */
interface ColaboradorResponse {
  id: string;
  codigo: string;
  nome: string;
  usuarioId: string;
  usuarioLogin: string | null;
  unidadeId: string;
  unidadeNome: string | null;
  dataCriacao: string;
  dataAtualizacao: string | null;
}

@Injectable({ providedIn: 'root' })
export class ColaboradorService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/colaboradores`;

  private toModel(r: ColaboradorResponse): Colaborador {
    return {
      id: r.id,
      codigo: r.codigo,
      nome: r.nome,
      usuarioId: r.usuarioId,
      usuarioLogin: r.usuarioLogin ?? '—',
      unidadeId: r.unidadeId,
      unidadeNome: r.unidadeNome ?? '—',
      criadoEm: r.dataCriacao?.slice(0, 10) ?? '',
    };
  }

  /**
   * GET /api/colaboradores. Busca (nome/login) e filtro por unidade são aplicados no cliente,
   * mantendo a assinatura usada pela tela.
   */
  listar(busca = '', unidadeId: string | 'TODAS' = 'TODAS'): Observable<Colaborador[]> {
    const termo = busca.trim().toLowerCase();
    return this.http.get<ColaboradorResponse[]>(this.base).pipe(
      map((lista) => lista.map((c) => this.toModel(c))),
      map((lista) =>
        lista.filter((c) => {
          const bateBusca =
            !termo ||
            c.nome.toLowerCase().includes(termo) ||
            c.usuarioLogin.toLowerCase().includes(termo);
          const bateUnidade = unidadeId === 'TODAS' || c.unidadeId === unidadeId;
          return bateBusca && bateUnidade;
        }),
      ),
    );
  }

  /** POST /api/colaboradores */
  criar(dto: ColaboradorCreateDto): Observable<Colaborador> {
    return this.http.post<ColaboradorResponse>(this.base, dto).pipe(map((c) => this.toModel(c)));
  }

  /**
   * Edição: nome via PUT e, em seguida, transferência de unidade via PATCH
   * (o backend valida a RN02 — unidade destino precisa estar ativa).
   */
  atualizar(id: string, dto: ColaboradorUpdateDto): Observable<Colaborador> {
    return this.http.put<ColaboradorResponse>(`${this.base}/${id}`, { nome: dto.nome }).pipe(
      concatMap(() =>
        this.http.patch<ColaboradorResponse>(`${this.base}/${id}/transferir`, {
          novaUnidadeId: dto.unidadeId,
        }),
      ),
      map((c) => this.toModel(c)),
    );
  }

  /** DELETE /api/colaboradores/{id} — Hard Delete. */
  remover(id: string): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
