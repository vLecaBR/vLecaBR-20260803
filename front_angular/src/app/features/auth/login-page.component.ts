import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { TextFieldComponent } from '../../shared/components/form-field/form-field';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, ButtonComponent, TextFieldComponent],
  template: `
    <main class="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_460px]">
      <section
        class="grid-paper relative hidden flex-col justify-between border-r border-border p-12 lg:flex"
      >
        <div class="flex items-center gap-3">
          <span
            class="flex h-7 w-7 items-center justify-center bg-primary font-mono text-[13px] font-bold text-primary-foreground"
            >G</span
          >
          <span class="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            Gestão · Colaboradores &amp; Unidades
          </span>
        </div>

        <div class="max-w-lg">
          <p class="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">Console operacional</p>
          <h1 class="mt-4 text-5xl font-semibold leading-[1.05] tracking-tight text-foreground">
            Um painel único para pessoas, acessos e unidades.
          </h1>
          <p class="mt-5 max-w-md text-[14px] leading-relaxed text-muted-foreground">
            Cadastro de usuários, vínculo de colaboradores e controle de unidades operando sobre a mesma
            base — com trilha de auditoria e autenticação por token.
          </p>
        </div>

        <dl class="grid grid-cols-3 gap-px border border-border bg-border">
          @for (item of vitrine; track item.label) {
            <div class="bg-card px-4 py-3">
              <dt class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {{ item.label }}
              </dt>
              <dd class="mt-1 font-mono text-2xl tabular-nums text-foreground">{{ item.valor }}</dd>
            </div>
          }
        </dl>
      </section>

      <section class="flex items-center justify-center px-6 py-16">
        <form (ngSubmit)="submeter()" class="w-full max-w-[340px]">
          <div class="mb-8 lg:hidden">
            <span
              class="flex h-7 w-7 items-center justify-center bg-primary font-mono text-[13px] font-bold text-primary-foreground"
              >G</span
            >
          </div>

          <p class="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Autenticação</p>
          <h2 class="mt-2 text-2xl font-semibold tracking-tight text-foreground">Acessar o painel</h2>
          <p class="mt-1.5 text-[13px] text-muted-foreground">
            Use suas credenciais corporativas. Sessão válida por 60 minutos.
          </p>

          <div class="mt-8 flex flex-col gap-4">
            <app-text-field
              label="Login"
              autocomplete="username"
              placeholder="nome.sobrenome"
              [(ngModel)]="login"
              name="login"
            />
            <app-text-field
              label="Senha"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              [(ngModel)]="senha"
              name="senha"
            />
          </div>

          @if (erro()) {
            <p
              role="alert"
              class="mt-4 border border-danger/40 bg-danger/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-danger"
            >
              {{ erro() }}
            </p>
          }

          <app-button type="submit" variant="primary" [disabled]="carregando()" extraClass="mt-6 h-10 w-full">
            {{ carregando() ? 'Autenticando…' : 'Entrar' }}
          </app-button>
        </form>
      </section>
    </main>
  `,
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  login = 'master';
  senha = '';
  readonly erro = signal<string | null>(null);
  readonly carregando = signal(false);

  readonly vitrine = [
    { label: 'Unidades', valor: '05' },
    { label: 'Colaboradores', valor: '08' },
    { label: 'Acessos ativos', valor: '06' },
  ];

  submeter(): void {
    if (!this.login.trim() || !this.senha.trim()) {
      this.erro.set('Informe login e senha.');
      return;
    }
    this.erro.set(null);
    this.carregando.set(true);

    // POST /api/auth/login
    this.auth.login({ login: this.login, senha: this.senha }).subscribe({
      next: (resposta) => {
        this.auth.persistir(resposta, this.login);
        this.carregando.set(false);
        this.router.navigate(['/app/colaboradores'], { replaceUrl: true });
      },
      error: (e: Error) => {
        this.erro.set(e.message);
        this.carregando.set(false);
      },
    });
  }
}
