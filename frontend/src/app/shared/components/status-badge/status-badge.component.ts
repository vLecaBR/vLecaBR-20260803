import { Component, Input } from '@angular/core';
import type { Status } from '../../models';

/** Selo visual de status ATIVO/INATIVO. */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span
      class="inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em]"
      [class]="
        ativo
          ? 'border-ok/30 bg-ok/10 text-ok'
          : 'border-border bg-muted text-muted-foreground'
      "
    >
      <span
        aria-hidden="true"
        class="h-1.5 w-1.5"
        [class]="ativo ? 'bg-ok rounded-full' : 'bg-muted-foreground'"
      ></span>
      {{ ativo ? 'Ativo' : 'Inativo' }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: Status;

  get ativo(): boolean {
    return this.status === 'Ativo';
  }
}
