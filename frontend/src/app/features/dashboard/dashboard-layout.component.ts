import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  to: string;
  label: string;
  codigo: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="grid min-h-screen grid-cols-1 lg:grid-cols-[232px_1fr]">
      <aside
        class="flex flex-col border-b border-border bg-card lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r"
      >
        <div class="flex items-center gap-3 border-b border-border px-5 py-4">
          <span
            class="flex h-7 w-7 items-center justify-center bg-primary font-mono text-[13px] font-bold text-primary-foreground"
            >G</span
          >
          <div class="leading-tight">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">Gestão</p>
            <p class="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Colab. &amp; Unid.</p>
          </div>
        </div>

        <nav class="flex flex-1 flex-col gap-px p-2">
          <p class="px-3 py-3 font-mono text-[9px] uppercase tracking-[0.24em] text-muted-foreground/70">
            Cadastros
          </p>
          @for (item of nav; track item.to) {
            <a
              [routerLink]="item.to"
              routerLinkActive="border-primary bg-secondary text-primary"
              [routerLinkActiveOptions]="{ exact: false }"
              #rla="routerLinkActive"
              class="group flex items-center justify-between border-l-2 px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors"
              [class]="
                rla.isActive
                  ? ''
                  : 'border-transparent text-muted-foreground hover:border-border hover:bg-secondary/60 hover:text-foreground'
              "
            >
              {{ item.label }}
              <span class="text-[9px] tabular-nums opacity-50">{{ item.codigo }}</span>
            </a>
          }
        </nav>

        <div class="border-t border-border p-3">
          <div class="flex items-center gap-2.5 px-1 pb-3">
            <span
              class="flex h-7 w-7 items-center justify-center border border-border bg-secondary font-mono text-[10px] text-secondary-foreground"
              >{{ iniciais }}</span
            >
            <div class="min-w-0 leading-tight">
              <p class="truncate text-[12px] text-foreground">{{ usuario?.login ?? 'Usuário' }}</p>
              <p class="truncate font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                Sessão JWT
              </p>
            </div>
          </div>
          <button
            type="button"
            (click)="sair()"
            class="w-full border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-danger/50 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Sair
          </button>
        </div>
      </aside>

      <div class="flex min-w-0 flex-col">
        <header
          class="flex items-center justify-between gap-4 border-b border-border bg-card/60 px-6 py-3 backdrop-blur"
        >
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Console · <span class="text-foreground">produção</span>
          </p>
          <div
            class="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
          >
            <span class="hidden sm:inline">Sessão JWT ativa</span>
            <span class="flex items-center gap-1.5 text-ok">
              <span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-ok"></span>
              Online
            </span>
          </div>
        </header>

        <main class="scrolling flex-1 px-6 py-8 lg:px-10 lg:py-10">
          <div class="mx-auto w-full max-w-6xl">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
})
export class DashboardLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly usuario = this.auth.usuarioLogado();
  readonly nav: NavItem[] = [
    { to: '/app/usuarios', label: 'Usuários', codigo: '01' },
    { to: '/app/colaboradores', label: 'Colaboradores', codigo: '02' },
    { to: '/app/unidades', label: 'Unidades', codigo: '03' },
  ];

  get iniciais(): string {
    return (this.usuario?.login ?? 'US').slice(0, 2).toUpperCase();
  }

  sair(): void {
    // INTEGRAÇÃO: opcionalmente POST /api/auth/logout antes de limpar a sessão.
    this.auth.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
