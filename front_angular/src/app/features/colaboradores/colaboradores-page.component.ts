import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, debounceTime, switchMap, tap } from 'rxjs';
import { ColaboradorService } from '../../core/services/colaborador.service';
import { ToastService } from '../../core/services/toast.service';
import { UnidadeService } from '../../core/services/unidade.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ColumnDirective } from '../../shared/components/data-table/column.directive';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { SelectFieldComponent, TextFieldComponent } from '../../shared/components/form-field/form-field';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import type { Colaborador } from '../../shared/models';
import { ColaboradorFormModalComponent } from './colaborador-form-modal.component';

@Component({
  selector: 'app-colaboradores-page',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    PageHeaderComponent,
    ButtonComponent,
    TextFieldComponent,
    SelectFieldComponent,
    DataTableComponent,
    ColumnDirective,
    ModalComponent,
    ColaboradorFormModalComponent,
  ],
  template: `
    @let colaboradores = colaboradores$ | async;
    @let unidades = unidades$ | async;
    <div class="flex flex-col gap-6">
      <app-page-header
        eyebrow="Cadastro 02"
        title="Colaboradores"
        description="Pessoas vinculadas a um usuário de acesso e a uma unidade operacional."
        [metrics]="[
          { label: 'Total listado', valor: carregando() ? '—' : (colaboradores?.length ?? 0) },
          { label: 'Unidades ativas', valor: unidadesAtivas(unidades) },
          { label: 'Filtro unidade', valor: unidadeFiltroLabel() },
          { label: 'Busca', valor: busca() ? '“' + busca() + '”' : '—' }
        ]"
      >
        <app-button actions variant="primary" (click)="abrirCadastro()">+ Novo colaborador</app-button>
      </app-page-header>

      <div class="grid gap-4 sm:grid-cols-[1fr_220px]">
        <app-text-field
          label="Buscar por nome ou login"
          placeholder="Ex.: Renata"
          [ngModel]="busca()"
          (ngModelChange)="mudarBusca($event)"
          name="busca"
        />
        <app-select-field
          label="Unidade"
          [ngModel]="unidadeFiltro()"
          (ngModelChange)="mudarUnidade($event)"
          name="unidadeFiltro"
        >
          <option value="TODAS">TODAS</option>
          @for (u of unidades ?? []; track u.id) {
            <option [value]="u.id">{{ u.codigo }} · {{ u.nome }}</option>
          }
        </app-select-field>
      </div>

      <app-data-table
        [rows]="colaboradores ?? []"
        [rowKey]="rowKey"
        [loading]="carregando()"
        emptyMessage="Nenhum colaborador encontrado."
      >
        <ng-template [appColumn]="colaboradores ?? []" header="Código" width="w-[100px]" let-c>
          <span class="font-mono tabular-nums text-muted-foreground">{{ c.codigo }}</span>
        </ng-template>
        <ng-template [appColumn]="colaboradores ?? []" header="Nome" let-c>
          <span class="text-foreground">{{ c.nome }}</span>
        </ng-template>
        <ng-template [appColumn]="colaboradores ?? []" header="Usuário" width="w-[190px]" let-c>
          <span class="font-mono text-[12px] text-muted-foreground">{{ c.usuarioLogin }}</span>
        </ng-template>
        <ng-template [appColumn]="colaboradores ?? []" header="Unidade vinculada" width="w-[240px]" let-c>
          <span class="text-[13px] text-foreground">{{ c.unidadeNome }}</span>
        </ng-template>
        <ng-template [appColumn]="colaboradores ?? []" header="Ações" align="right" width="w-[160px]" let-c>
          <span class="flex items-center justify-end gap-1">
            <app-button variant="ghost" (click)="abrirEdicao(c)">Editar</app-button>
            <app-button variant="ghost" extraClass="hover:text-danger" (click)="paraRemover.set(c)">Remover</app-button>
          </span>
        </ng-template>
      </app-data-table>

      <app-colaborador-form-modal
        [open]="modalAberto()"
        [colaborador]="emEdicao()"
        (onClose)="modalAberto.set(false)"
        (onSaved)="aoSalvar()"
      />

      <app-modal
        [open]="paraRemover() !== null"
        title="Remover colaborador"
        subtitle="A operação exclui o colaborador definitivamente e mantém o usuário de acesso."
        width="max-w-md"
        (close)="paraRemover.set(null)"
      >
        <p class="text-[13px] leading-relaxed text-muted-foreground">
          Confirmar a remoção de
          <strong class="text-foreground">{{ paraRemover()?.nome }}</strong>
          <span class="font-mono text-[12px]">({{ paraRemover()?.codigo }})</span> da unidade
          <span class="text-[12px] text-accent">{{ paraRemover()?.unidadeNome }}</span>?
        </p>
        <ng-container footer>
          <app-button variant="ghost" (click)="paraRemover.set(null)">Cancelar</app-button>
          <app-button variant="danger" [disabled]="removendo()" (click)="confirmarRemocao()">
            {{ removendo() ? 'Removendo…' : 'Confirmar remoção' }}
          </app-button>
        </ng-container>
      </app-modal>
    </div>
  `,
})
export class ColaboradoresPageComponent {
  private readonly service = inject(ColaboradorService);
  private readonly unidadeService = inject(UnidadeService);
  private readonly toast = inject(ToastService);

  private readonly busca$ = new BehaviorSubject<string>('');
  private readonly unidade$ = new BehaviorSubject<string>('TODAS');
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  readonly busca = signal('');
  readonly unidadeFiltro = signal('TODAS');
  readonly carregando = signal(true);
  readonly modalAberto = signal(false);
  readonly emEdicao = signal<Colaborador | null>(null);
  readonly paraRemover = signal<Colaborador | null>(null);
  readonly removendo = signal(false);

  readonly rowKey = (c: Colaborador): string => c.id;

  readonly colaboradores$ = combineLatest([this.busca$, this.unidade$, this.refresh$]).pipe(
    debounceTime(300),
    tap(() => this.carregando.set(true)),
    // GET /api/colaboradores (busca e unidade filtradas no cliente)
    switchMap(([busca, unidade]) => this.service.listar(busca, unidade)),
    tap(() => this.carregando.set(false)),
  );

  readonly unidades$ = this.unidadeService.listar('TODOS');

  unidadesAtivas(unidades: { status: string }[] | null | undefined): number {
    return (unidades ?? []).filter((u) => u.status === 'Ativo').length;
  }

  /** Rótulo amigável do filtro de unidade (o valor interno é o Guid). */
  unidadeFiltroLabel(): string {
    return this.unidadeFiltro() === 'TODAS' ? 'TODAS' : 'Unidade';
  }

  mudarBusca(valor: string): void {
    this.busca.set(valor);
    this.busca$.next(valor);
  }

  mudarUnidade(valor: string): void {
    this.unidadeFiltro.set(valor);
    this.unidade$.next(valor);
  }

  abrirCadastro(): void {
    this.emEdicao.set(null);
    this.modalAberto.set(true);
  }

  abrirEdicao(colaborador: Colaborador): void {
    this.emEdicao.set(colaborador);
    this.modalAberto.set(true);
  }

  aoSalvar(): void {
    this.modalAberto.set(false);
    this.refresh$.next();
  }

  confirmarRemocao(): void {
    const alvo = this.paraRemover();
    if (!alvo) {
      return;
    }
    this.removendo.set(true);
    // DELETE /api/colaboradores/{id}
    this.service.remover(alvo.id).subscribe({
      next: () => {
        this.removendo.set(false);
        this.paraRemover.set(null);
        this.toast.sucesso(`Colaborador ${alvo.nome} removido.`);
        this.refresh$.next();
      },
      error: (e: Error) => {
        this.removendo.set(false);
        this.toast.erro(e.message || 'Não foi possível remover o colaborador.');
      },
    });
  }
}
