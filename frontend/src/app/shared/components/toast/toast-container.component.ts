import { Component, inject } from '@angular/core';
import { ToastService, ToastTipo } from '../../../core/services/toast.service';

/** Pilha de notificações no canto inferior direito. */
@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="pointer-events-none fixed bottom-5 right-5 z-50 flex w-[320px] flex-col gap-2">
      @for (t of toastService.toasts(); track t.id) {
        <div
          role="status"
          class="toast-enter pointer-events-auto flex items-start gap-3 border bg-card px-4 py-3 shadow-lg"
          [class]="borda(t.tipo)"
        >
          <span aria-hidden="true" class="mt-1 h-2 w-2 shrink-0 rounded-full" [class]="ponto(t.tipo)"></span>
          <p class="flex-1 text-[13px] leading-snug text-foreground">{{ t.mensagem }}</p>
          <button
            type="button"
            (click)="toastService.remover(t.id)"
            aria-label="Fechar notificação"
            class="font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);

  borda(tipo: ToastTipo): string {
    switch (tipo) {
      case 'sucesso':
        return 'border-ok/40';
      case 'erro':
        return 'border-danger/50';
      default:
        return 'border-border';
    }
  }

  ponto(tipo: ToastTipo): string {
    switch (tipo) {
      case 'sucesso':
        return 'bg-ok';
      case 'erro':
        return 'bg-danger';
      default:
        return 'bg-accent';
    }
  }
}
