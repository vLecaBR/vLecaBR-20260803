import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Status, Usuario, UsuarioCreateDto, UsuarioUpdateDto } from '../../shared/models';

/** Formato bruto retornado pelo backend (UsuarioResponse). */
interface UsuarioResponse {
  id: string;
  codigo: string;
  login: string;
  status: Status;
  dataCriacao: string;
  dataAtualizacao: string | null;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/usuarios`;

  private toModel(r: UsuarioResponse): Usuario {
    return {
      id: r.id,
      codigo: r.codigo,
      login: r.login,
      status: r.status,
      criadoEm: r.dataCriacao?.slice(0, 10) ?? '',
    };
  }

  /** GET /api/usuarios?status= */
  listar(status: Status | 'TODOS' = 'TODOS'): Observable<Usuario[]> {
    let params = new HttpParams();
    if (status !== 'TODOS') {
      params = params.set('status', status);
    }
    return this.http
      .get<UsuarioResponse[]>(this.base, { params })
      .pipe(map((lista) => lista.map((u) => this.toModel(u))));
  }

  /** GET /api/usuarios/{id} */
  obter(id: string): Observable<Usuario> {
    return this.http.get<UsuarioResponse>(`${this.base}/${id}`).pipe(map((u) => this.toModel(u)));
  }

  /** POST /api/usuarios (+ inativação inicial se o status escolhido for Inativo). */
  criar(dto: UsuarioCreateDto): Observable<Usuario> {
    const body = { codigo: dto.codigo, login: dto.login, senha: dto.senha };
    return this.http.post<UsuarioResponse>(this.base, body).pipe(
      switchMap((resp) =>
        dto.status === 'Inativo'
          ? this.inativar(resp.id).pipe(map(() => this.toModel({ ...resp, status: 'Inativo' })))
          : of(this.toModel(resp)),
      ),
    );
  }

  /**
   * Edição (RN03): apenas senha e status.
   * Senha → PUT /senha; status → PATCH /ativar ou DELETE (soft delete / inativar).
   */
  atualizar(id: string, dto: UsuarioUpdateDto): Observable<unknown> {
    const chamadas: Observable<unknown>[] = [];
    if (dto.senha) {
      chamadas.push(this.http.put(`${this.base}/${id}/senha`, { novaSenha: dto.senha }));
    }
    chamadas.push(dto.status === 'Ativo' ? this.ativar(id) : this.inativar(id));
    return forkJoin(chamadas);
  }

  /** PATCH /api/usuarios/{id}/ativar */
  ativar(id: string): Observable<unknown> {
    return this.http.patch(`${this.base}/${id}/ativar`, {});
  }

  /** DELETE /api/usuarios/{id} — Soft Delete (inativação). */
  inativar(id: string): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
