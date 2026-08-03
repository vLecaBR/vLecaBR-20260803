import { Component, Input } from '@angular/core';

export interface Metric {
  label: string;
  valor: string | number;
}

/** Cabeçalho de página com eyebrow, título, descrição, ações projetadas e métricas. */
@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="border-b border-border pb-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div class="max-w-xl">
          <p class="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">{{ eyebrow }}</p>
          <h1 class="mt-2 text-[26px] font-semibold leading-tight tracking-tight text-foreground">
            {{ title }}
          </h1>
          <p class="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{{ description }}</p>
        </div>
        <div class="flex items-center gap-2">
          <ng-content select="[actions]" />
        </div>
      </div>

      @if (metrics?.length) {
        <dl class="mt-6 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
          @for (metric of metrics; track metric.label) {
            <div class="bg-card px-4 py-3">
              <dt class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {{ metric.label }}
              </dt>
              <dd class="mt-1 font-mono text-xl tabular-nums text-foreground">{{ metric.valor }}</dd>
            </div>
          }
        </dl>
      }
    </header>
  `,
})
export class PageHeaderComponent {
  @Input({ required: true }) eyebrow!: string;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) description!: string;
  @Input() metrics: Metric[] | null = null;
}
