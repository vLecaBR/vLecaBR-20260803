import { Component, EventEmitter, inject, Input, OnChanges, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { SelectFieldComponent, TextFieldComponent } from '../../shared/components/form-field/form-field';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import type { Status, Usuario } from '../../shared/models';

@Component({
  selector: 'app-usuario-form-modal',
  standalone: true,
  imports: [FormsModule, ModalComponent, ButtonComponent, TextFieldComponent, SelectFieldComponent],
  template: `
    <app-modal
      [open]="open"
      [title]="edicao ? 'Editar usuário ' + usuario?.codigo : 'Novo usuário'"
      [subtitle]="
        edicao
          ? 'Login e código são imutáveis. Apenas senha e status podem ser alterados.'
          : 'Informe um código único, o login e a senha inicial.'
      "
      (close)="onClose.emit()"
    >
      <div class="flex flex-col gap-4">
        <app-text-field
          label="Código"
          placeholder="Ex.: U001"
          [(ngModel)]="codigo"
          [readonly]="edicao"
          [hint]="edicao ? 'bloqueado' : 'único'"
          name="codigo"
        />

        <app-text-field
          label="Login"
          placeholder="nome.sobrenome"
          [(ngModel)]="login"
          [readonly]="edicao"
          [hint]="edicao ? 'bloqueado' : ''"
          name="login"
        />

        <app-text-field
          label="Senha"
          type="password"
          [(ngModel)]="senha"
          [placeholder]="edicao ? 'Deixe vazio para manter a atual' : '••••••••'"
          [hint]="edicao ? 'opcional' : 'mín. 6 caracteres'"
          name="senha"
        />

        <app-select-field label="Status" [(ngModel)]="status" name="status">
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
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
export class UsuarioFormModalComponent implements OnChanges {
  private readonly service = inject(UsuarioService);
  private readonly toast = inject(ToastService);

  /** `null` = cadastro; preenchido = edição. */
  @Input() usuario: Usuario | null = null;
  @Input() open = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSaved = new EventEmitter<void>();

  codigo = '';
  login = '';
  senha = '';
  status: Status = 'Ativo';
  readonly salvando = signal(false);
  readonly erro = signal<string | null>(null);

  get edicao(): boolean {
    return this.usuario !== null;
  }

  ngOnChanges(): void {
    if (!this.open) {
      return;
    }
    this.codigo = this.usuario?.codigo ?? '';
    this.login = this.usuario?.login ?? '';
    this.senha = '';
    this.status = this.usuario?.status ?? 'Ativo';
    this.erro.set(null);
  }

  salvar(): void {
    if (!this.edicao && (!this.codigo.trim() || !this.login.trim() || this.senha.length < 6)) {
      this.erro.set('Informe código, login e uma senha com pelo menos 6 caracteres.');
      return;
    }
    if (this.edicao && this.senha && this.senha.length < 6) {
      this.erro.set('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    this.erro.set(null);
    this.salvando.set(true);

    // POST /api/usuarios | edição via PUT /senha + ativar/inativar
    const request$ = this.edicao
      ? this.service.atualizar(this.usuario!.id, { senha: this.senha || undefined, status: this.status })
      : this.service.criar({ codigo: this.codigo, login: this.login, senha: this.senha, status: this.status });

    const mensagemOk = this.edicao
      ? this.senha
        ? 'Senha e status atualizados com sucesso.'
        : 'Status do usuário atualizado com sucesso.'
      : 'Usuário cadastrado com sucesso.';

    request$.subscribe({
      next: () => {
        this.salvando.set(false);
        this.toast.sucesso(mensagemOk);
        this.onSaved.emit();
      },
      error: (e: Error) => {
        this.erro.set(e.message);
        this.salvando.set(false);
      },
    });
  }
}
