import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ColaboradorService } from '../../core/services/colaborador.service';
import { ToastService } from '../../core/services/toast.service';
import { UnidadeService } from '../../core/services/unidade.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { SelectFieldComponent, TextFieldComponent } from '../../shared/components/form-field/form-field';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import type { Colaborador, Unidade, Usuario } from '../../shared/models';

@Component({
  selector: 'app-colaborador-form-modal',
  standalone: true,
  imports: [AsyncPipe, FormsModule, ModalComponent, ButtonComponent, TextFieldComponent, SelectFieldComponent],
  template: `
    <app-modal
      [open]="open"
      [title]="edicao ? 'Editar colaborador ' + colaborador?.codigo : 'Novo colaborador'"
      [subtitle]="
        edicao
          ? 'O usuário vinculado é imutável — nome e unidade podem ser alterados.'
          : 'Vincule o colaborador a um usuário ativo e a uma unidade operante.'
      "
      (close)="onClose.emit()"
    >
      <div class="flex flex-col gap-4">
        <app-text-field
          label="Código"
          placeholder="Ex.: C001"
          [(ngModel)]="codigo"
          [readonly]="edicao"
          [hint]="edicao ? 'bloqueado' : 'único'"
          name="codigo"
        />

        <app-text-field label="Nome completo" placeholder="Nome e sobrenome" [(ngModel)]="nome" name="nome" />

        @if (edicao) {
          <app-text-field label="Usuário vinculado" [ngModel]="colaborador?.usuarioLogin ?? ''" [readonly]="true" hint="bloqueado" name="usuario" />
        } @else {
          <app-select-field label="Usuário" [(ngModel)]="usuarioId" name="usuarioId">
            <option value="">Selecione um usuário…</option>
            @for (u of (usuarios$ | async) ?? []; track u.id) {
              <option [value]="u.id">{{ u.codigo }} · {{ u.login }}</option>
            }
          </app-select-field>
        }

        <app-select-field label="Unidade" [(ngModel)]="unidadeId" name="unidadeId">
          <option value="">Selecione uma unidade…</option>
          @for (u of (unidades$ | async) ?? []; track u.id) {
            <option [value]="u.id">
              {{ u.codigo }} · {{ u.nome }}{{ u.status === 'Inativo' ? ' (inativa)' : '' }}
            </option>
          }
        </app-select-field>

        @if (erro()) {
          <p role="alert" class="border border-danger/40 bg-danger/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-danger">
            {{ erro() }}
          </p>
        }
      </div>

      <ng-container footer>
        <app-button variant="ghost" (click)="onClose.emit()">Cancelar</app-button>
        <app-button variant="primary" [disabled]="salvando()" (click)="salvar()">
          {{ salvando() ? 'Salvando…' : edicao ? 'Salvar alterações' : 'Cadastrar' }}
        </app-button>
      </ng-container>
    </app-modal>
  `,
})
export class ColaboradorFormModalComponent implements OnChanges {
  private readonly service = inject(ColaboradorService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly unidadeService = inject(UnidadeService);
  private readonly toast = inject(ToastService);

  /** `null` = cadastro; preenchido = edição. */
  @Input() colaborador: Colaborador | null = null;
  @Input() open = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSaved = new EventEmitter<void>();

  codigo = '';
  nome = '';
  usuarioId = '';
  unidadeId = '';
  readonly salvando = signal(false);
  readonly erro = signal<string | null>(null);

  // Selects: usuários ativos e todas as unidades.
  readonly usuarios$: Observable<Usuario[]> = this.usuarioService.listar('Ativo');
  readonly unidades$: Observable<Unidade[]> = this.unidadeService.listar('TODOS');

  get edicao(): boolean {
    return this.colaborador !== null;
  }

  ngOnChanges(): void {
    if (!this.open) {
      return;
    }
    this.codigo = this.colaborador?.codigo ?? '';
    this.nome = this.colaborador?.nome ?? '';
    this.usuarioId = this.colaborador?.usuarioId ?? '';
    this.unidadeId = this.colaborador?.unidadeId ?? '';
    this.erro.set(null);
  }

  salvar(): void {
    if (
      !this.nome.trim() ||
      !this.unidadeId ||
      (!this.edicao && (!this.codigo.trim() || !this.usuarioId))
    ) {
      this.erro.set('Preencha código, nome, usuário vinculado e unidade.');
      return;
    }
    this.erro.set(null);
    this.salvando.set(true);

    // POST /api/colaboradores | edição: PUT nome + PATCH transferir
    const request$ = this.edicao
      ? this.service.atualizar(this.colaborador!.id, { nome: this.nome, unidadeId: this.unidadeId })
      : this.service.criar({
          codigo: this.codigo,
          nome: this.nome,
          usuarioId: this.usuarioId,
          unidadeId: this.unidadeId,
        });

    request$.subscribe({
      next: () => {
        this.salvando.set(false);
        this.toast.sucesso(this.edicao ? 'Colaborador atualizado com sucesso.' : 'Colaborador cadastrado com sucesso.');
        this.onSaved.emit();
      },
      error: (e: Error) => {
        this.erro.set(e.message);
        this.salvando.set(false);
      },
    });
  }
}
