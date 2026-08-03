import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  ColaboradorResumo,
  Status,
  Unidade,
  UnidadeCreateDto,
  UnidadeUpdateDto,
} from '../../shared/models';

/** Formato bruto retornado pelo backend (UnidadeResponse). */
interface UnidadeResponse {
  id: string;
  codigo: string;
  nome: string;
  status: Status;
  dataCriacao: string;
  dataAtualizacao: string | null;
  colaboradores: ColaboradorResumo[];
}

@Injectable({ providedIn: 'root' })
export class UnidadeService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/unidades`;

  private toModel(r: UnidadeResponse): Unidade {
    const colaboradores = r.colaboradores ?? [];
    return {
      id: r.id,
      codigo: r.codigo,
      nome: r.nome,
      status: r.status,
      criadoEm: r.dataCriacao?.slice(0, 10) ?? '',
      colaboradores,
      totalColaboradores: colaboradores.length,
    };
  }

  /** GET /api/unidades (o filtro por status é aplicado no cliente). */
  listar(status: Status | 'TODOS' = 'TODOS'): Observable<Unidade[]> {
    return this.http.get<UnidadeResponse[]>(this.base).pipe(
      map((lista) => lista.map((u) => this.toModel(u))),
      map((lista) => (status === 'TODOS' ? lista : lista.filter((u) => u.status === status))),
    );
  }

  /** GET /api/unidades/{id} */
  obter(id: string): Observable<Unidade> {
    return this.http.get<UnidadeResponse>(`${this.base}/${id}`).pipe(map((u) => this.toModel(u)));
  }

  /** POST /api/unidades (+ inativação inicial se o status escolhido for Inativo). */
  criar(dto: UnidadeCreateDto): Observable<Unidade> {
    const body = { codigo: dto.codigo, nome: dto.nome };
    return this.http.post<UnidadeResponse>(this.base, body).pipe(
      switchMap((resp) =>
        dto.status === 'Inativo'
          ? this.inativar(resp.id).pipe(map(() => this.toModel({ ...resp, status: 'Inativo' })))
          : of(this.toModel(resp)),
      ),
    );
  }

  /** Edição: nome (PUT) + situação (ativar/inativar). */
  atualizar(id: string, dto: UnidadeUpdateDto): Observable<unknown> {
    const chamadas: Observable<unknown>[] = [
      this.http.put(`${this.base}/${id}`, { nome: dto.nome }),
      dto.status === 'Ativo' ? this.ativar(id) : this.inativar(id),
    ];
    return forkJoin(chamadas);
  }

  /** PATCH /api/unidades/{id}/ativar */
  ativar(id: string): Observable<unknown> {
    return this.http.patch(`${this.base}/${id}/ativar`, {});
  }

  /** DELETE /api/unidades/{id} — inativação. */
  inativar(id: string): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
