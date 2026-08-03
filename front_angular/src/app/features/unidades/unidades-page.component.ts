import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, switchMap, tap } from 'rxjs';
import { UnidadeService } from '../../core/services/unidade.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ColumnDirective } from '../../shared/components/data-table/column.directive';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { SelectFieldComponent } from '../../shared/components/form-field/form-field';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import type { Status, Unidade } from '../../shared/models';
import { UnidadeFormModalComponent } from './unidade-form-modal.component';

type FiltroStatus = Status | 'TODOS';

@Component({
  selector: 'app-unidades-page',
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
    UnidadeFormModalComponent,
  ],
  template: `
    @let vm = vm$ | async;
    <div class="flex flex-col gap-6">
      <app-page-header
        eyebrow="Cadastro 03"
        title="Unidades"
        description="Filiais, centros de distribuição e hubs. Inativar uma unidade bloqueia novos vínculos de colaboradores."
        [metrics]="[
          { label: 'Total listado', valor: carregando() ? '—' : (vm?.unidades?.length ?? 0) },
          { label: 'Ativas', valor: carregando() ? '—' : (vm?.ativas ?? 0) },
          { label: 'Inativas', valor: carregando() ? '—' : (vm?.inativas ?? 0) },
          { label: 'Colaboradores', valor: carregando() ? '—' : (vm?.totalColaboradores ?? 0) }
        ]"
      >
        <app-button actions variant="primary" (click)="abrirCadastro()">+ Nova unidade</app-button>
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
          {{ carregando() ? 'Consultando API…' : (vm?.unidades?.length ?? 0) + ' registro(s)' }}
        </p>
      </div>

      <app-data-table
        [rows]="vm?.unidades ?? []"
        [rowKey]="rowKey"
        [loading]="carregando()"
        emptyMessage="Nenhuma unidade para o filtro selecionado."
        [expandedKey]="expandida()"
      >
        <ng-template [appColumn]="vm?.unidades ?? []" header="Código" width="w-[120px]" let-u>
          <span class="font-mono uppercase tracking-[0.1em] text-accent">{{ u.codigo }}</span>
        </ng-template>
        <ng-template [appColumn]="vm?.unidades ?? []" header="Nome" let-u>
          <span class="text-foreground">{{ u.nome }}</span>
        </ng-template>
        <ng-template [appColumn]="vm?.unidades ?? []" header="Equipe" width="w-[90px]" let-u>
          <span class="font-mono tabular-nums text-muted-foreground">{{ u.totalColaboradores }}</span>
        </ng-template>
        <ng-template [appColumn]="vm?.unidades ?? []" header="Status" width="w-[120px]" let-u>
          <app-status-badge [status]="u.status" />
        </ng-template>
        <ng-template [appColumn]="vm?.unidades ?? []" header="Ações" align="right" width="w-[240px]" let-u>
          <span class="flex items-center justify-end gap-1">
            <app-button variant="outline" [ariaExpanded]="expandida() === u.id" (click)="alternarEquipe(u)">
              {{ expandida() === u.id ? 'Ocultar equipe' : 'Ver colaboradores' }}
            </app-button>
            <app-button variant="ghost" (click)="abrirEdicao(u)">Editar</app-button>
          </span>
        </ng-template>

        <ng-template #expanded let-u>
          <div>
            <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Colaboradores · {{ u.nome }}
            </p>

            @if (u.colaboradores.length === 0) {
              <p class="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Nenhum colaborador vinculado a esta unidade.
              </p>
            } @else {
              <ul class="grid gap-px border border-border bg-border sm:grid-cols-2">
                @for (c of u.colaboradores; track c.id) {
                  <li class="flex items-center justify-between gap-4 bg-card px-4 py-3">
                    <span class="text-[13px] text-foreground">{{ c.nome }}</span>
                    <span class="text-right font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      #{{ c.codigo }}
                    </span>
                  </li>
                }
              </ul>
            }
          </div>
        </ng-template>
      </app-data-table>

      <app-unidade-form-modal
        [open]="modalAberto()"
        [unidade]="emEdicao()"
        (onClose)="modalAberto.set(false)"
        (onSaved)="aoSalvar()"
      />
    </div>
  `,
})
export class UnidadesPageComponent {
  private readonly service = inject(UnidadeService);

  private readonly filtro$ = new BehaviorSubject<FiltroStatus>('TODOS');
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  readonly filtro = signal<FiltroStatus>('TODOS');
  readonly carregando = signal(true);
  readonly modalAberto = signal(false);
  readonly emEdicao = signal<Unidade | null>(null);

  readonly expandida = signal<string | null>(null);

  readonly rowKey = (u: Unidade): string => u.id;

  readonly vm$ = combineLatest([this.filtro$, this.refresh$]).pipe(
    tap(() => this.carregando.set(true)),
    // GET /api/unidades (filtro por status aplicado no cliente)
    switchMap(([filtro]) => this.service.listar(filtro)),
    map((unidades) => ({
      unidades,
      ativas: unidades.filter((u) => u.status === 'Ativo').length,
      inativas: unidades.filter((u) => u.status === 'Inativo').length,
      totalColaboradores: unidades.reduce((total, u) => total + u.totalColaboradores, 0),
    })),
    tap(() => this.carregando.set(false)),
  );

  mudarFiltro(valor: string): void {
    this.filtro.set(valor as FiltroStatus);
    this.filtro$.next(valor as FiltroStatus);
  }

  /** A lista de colaboradores já vem embutida na unidade; o toggle só controla a expansão. */
  alternarEquipe(unidade: Unidade): void {
    this.expandida.set(this.expandida() === unidade.id ? null : unidade.id);
  }

  abrirCadastro(): void {
    this.emEdicao.set(null);
    this.modalAberto.set(true);
  }

  abrirEdicao(unidade: Unidade): void {
    this.emEdicao.set(unidade);
    this.modalAberto.set(true);
  }

  aoSalvar(): void {
    this.modalAberto.set(false);
    this.refresh$.next();
  }
}
