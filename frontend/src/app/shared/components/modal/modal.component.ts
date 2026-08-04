import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

/**
 * Modal genérico com header (título/subtítulo), corpo projetado e footer projetado.
 * Fecha com ESC ou clique no ✕. Uso de `@if` para montar/desmontar.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (open) {
      <div
        class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-[2px] sm:items-center"
      >
        <div
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title"
          [class]="'w-full ' + width + ' border border-border bg-card shadow-[0_24px_80px_-24px_rgba(0,0,0,0.9)]'"
        >
          <header class="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <h2 class="font-mono text-[13px] uppercase tracking-[0.2em] text-foreground">{{ title }}</h2>
              @if (subtitle) {
                <p class="mt-1 text-[13px] text-muted-foreground">{{ subtitle }}</p>
              }
            </div>
            <button
              type="button"
              aria-label="Fechar"
              (click)="close.emit()"
              class="-mr-1 -mt-1 flex h-7 w-7 items-center justify-center border border-transparent font-mono text-muted-foreground transition-colors hover:border-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              ✕
            </button>
          </header>

          <div class="px-5 py-5">
            <ng-content />
          </div>

          <footer class="flex items-center justify-end gap-2 border-t border-border bg-muted/40 px-5 py-3">
            <ng-content select="[footer]" />
          </footer>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  @Input() open = false;
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
  @Input() width = 'max-w-lg';
  @Output() close = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) {
      this.close.emit();
    }
  }
}
