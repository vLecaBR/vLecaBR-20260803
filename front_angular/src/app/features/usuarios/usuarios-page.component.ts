import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, switchMap, tap } from 'rxjs';
import { UsuarioService } from '../../core/services/usuario.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ColumnDirective } from '../../shared/components/data-table/column.directive';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { SelectFieldComponent } from '../../shared/components/form-field/form-field';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import type { Status, Usuario } from '../../shared/models';
import { UsuarioFormModalComponent } from './usuario-form-modal.component';

type FiltroStatus = Status | 'TODOS';

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    PageHeaderComponent,
    ButtonComponent,
    SelectFieldComponent,
    DataTableComponent,
    ColumnDirective,
    StatusBadgeComponent,
    UsuarioFormModalComponent,
  ],
  template: `
    @let vm = vm$ | async;
    <div class="flex flex-col gap-6">
      <app-page-header
        eyebrow="Cadastro 01"
        title="Usuários"
        description="Credenciais de acesso ao console. O login é definido no cadastro e não pode ser alterado depois."
        [metrics]="[
          { label: 'Total listado', valor: carregando() ? '—' : (vm?.usuarios?.length ?? 0) },
          { label: 'Ativos', valor: carregando() ? '—' : (vm?.ativos ?? 0) },
          { label: 'Inativos', valor: carregando() ? '—' : (vm?.inativos ?? 0) },
          { label: 'Filtro', valor: filtro() }
        ]"
      >
        <app-button actions variant="primary" (click)="abrirCadastro()">+ Novo usuário</app-button>
      </app-page-header>

      <div class="flex flex-wrap items-end justify-between gap-4">
        <div class="w-[200px]">
          <app-select-field
            label="Filtrar por status"
            [ngModel]="filtro()"
            (ngModelChange)="mudarFiltro($event)"
            name="filtro"
          >
            <option value="TODOS">TODOS</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </app-select-field>
        </div>
        <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {{ carregando() ? 'Consultando API…' : (vm?.usuarios?.length ?? 0) + ' registro(s)' }}
        </p>
      </div>

      <app-data-table
        [rows]="vm?.usuarios ?? []"
        [rowKey]="rowKey"
        [loading]="carregando()"
        emptyMessage="Nenhum usuário para o filtro selecionado."
      >
        <ng-template [appColumn]="vm?.usuarios ?? []" header="Código" width="w-[110px]" let-u>
          <span class="font-mono tabular-nums text-muted-foreground">{{ u.codigo }}</span>
        </ng-template>
        <ng-template [appColumn]="vm?.usuarios ?? []" header="Login" let-u>
          <span class="font-mono text-foreground">{{ u.login }}</span>
        </ng-template>
        <ng-template [appColumn]="vm?.usuarios ?? []" header="Criado em" width="w-[140px]" let-u>
          <span class="font-mono text-[12px] tabular-nums text-muted-foreground">{{ u.criadoEm }}</span>
        </ng-template>
        <ng-template [appColumn]="vm?.usuarios ?? []" header="Status" width="w-[120px]" let-u>
          <app-status-badge [status]="u.status" />
        </ng-template>
        <ng-template [appColumn]="vm?.usuarios ?? []" header="Ações" align="right" width="w-[100px]" let-u>
          <app-button variant="ghost" [ariaLabel]="'Editar usuário ' + u.login" (click)="abrirEdicao(u)">
            Editar
          </app-button>
        </ng-template>
      </app-data-table>

      <app-usuario-form-modal
        [open]="modalAberto()"
        [usuario]="emEdicao()"
        (onClose)="modalAberto.set(false)"
        (onSaved)="aoSalvar()"
      />
    </div>
  `,
})
export class UsuariosPageComponent {
  private readonly service = inject(UsuarioService);

  private readonly filtro$ = new BehaviorSubject<FiltroStatus>('TODOS');
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  readonly filtro = signal<FiltroStatus>('TODOS');
  readonly carregando = signal(true);
  readonly modalAberto = signal(false);
  readonly emEdicao = signal<Usuario | null>(null);

  readonly rowKey = (u: Usuario): string => u.id;

  /** Fluxo declarativo consumido via `async pipe`. */
  readonly vm$ = combineLatest([this.filtro$, this.refresh$]).pipe(
    tap(() => this.carregando.set(true)),
    // INTEGRAÇÃO: UsuarioService.listar → GET /api/usuarios?status={filtro}
    switchMap(([filtro]) => this.service.listar(filtro)),
    map((usuarios) => ({
      usuarios,
      ativos: usuarios.filter((u) => u.status === 'Ativo').length,
      inativos: usuarios.filter((u) => u.status === 'Inativo').length,
    })),
    tap(() => this.carregando.set(false)),
  );

  mudarFiltro(valor: string): void {
    this.filtro.set(valor as FiltroStatus);
    this.filtro$.next(valor as FiltroStatus);
  }

  abrirCadastro(): void {
    this.emEdicao.set(null);
    this.modalAberto.set(true);
  }

  abrirEdicao(usuario: Usuario): void {
    this.emEdicao.set(usuario);
    this.modalAberto.set(true);
  }

  aoSalvar(): void {
    this.modalAberto.set(false);
    this.refresh$.next();
  }
}
