import { Component, Input } from '@angular/core';

export type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'danger';

const BASE =
  'inline-flex items-center justify-center gap-2 h-8 px-3 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40 disabled:cursor-not-allowed';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/85 font-medium',
  ghost: 'text-muted-foreground hover:text-foreground hover:bg-secondary',
  outline: 'border border-border text-secondary-foreground hover:border-primary hover:text-primary',
  danger: 'border border-danger/40 text-danger hover:bg-danger/10',
};

/**
 * Botão reutilizável. Reproduz as variantes do protótipo React.
 * Uso: `<app-button variant="primary" (click)="...">Texto</app-button>`
 */
@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      [attr.aria-label]="ariaLabel"
      [attr.aria-expanded]="ariaExpanded"
      [class]="classes"
    >
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'outline';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() extraClass = '';
  @Input() ariaLabel?: string;
  @Input() ariaExpanded?: boolean;

  get classes(): string {
    return `${BASE} ${VARIANTS[this.variant]} ${this.extraClass}`;
  }
}
