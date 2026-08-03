import { NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, ContentChildren, Input, QueryList, TemplateRef } from '@angular/core';
import { ColumnContext, ColumnDirective } from './column.directive';

/**
 * Tabela de dados genérica.
 *  - Colunas declaradas via `<ng-template appColumn>` (projetadas por `@ContentChildren`).
 *  - Estado de carregamento com skeleton, estado vazio e linha expansível opcional
 *    (`<ng-template #expanded>`), usada na tela de Unidades.
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <div class="scrolling overflow-x-auto border border-border bg-card">
      <table class="w-full border-collapse text-[13px]">
        <thead>
          <tr class="border-b border-border bg-muted/60">
            @for (col of columns; track col.header) {
              <th scope="col" [class]="headerClass(col)">{{ col.header }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @if (loading) {
            @for (row of skeletonRows; track $index) {
              <tr class="border-b border-border/60">
                @for (col of columns; track col.header) {
                  <td class="px-4 py-3">
                    <span class="block h-3 w-full max-w-[160px] animate-pulse bg-secondary"></span>
                  </td>
                }
              </tr>
            }
          } @else if (rows.length === 0) {
            <tr>
              <td
                [attr.colspan]="columns.length"
                class="px-4 py-12 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
              >
                {{ emptyMessage }}
              </td>
            </tr>
          } @else {
            @for (row of rows; track rowKey(row)) {
              <tr [class]="rowClass(row)">
                @for (col of columns; track col.header) {
                  <td [class]="cellClass(col)">
                    <ng-container
                      [ngTemplateOutlet]="col.template"
                      [ngTemplateOutletContext]="{ $implicit: row }"
                    />
                  </td>
                }
              </tr>
              @if (expandedTemplate && isExpanded(row)) {
                <tr class="border-b border-border/60">
                  <td [attr.colspan]="columns.length" class="bg-background/70 px-4 py-4">
                    <ng-container
                      [ngTemplateOutlet]="expandedTemplate"
                      [ngTemplateOutletContext]="{ $implicit: row }"
                    />
                  </td>
                </tr>
              }
            }
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DataTableComponent<T> {
  @Input() rows: T[] = [];
  @Input({ required: true }) rowKey!: (row: T) => string | number;
  @Input() loading = false;
  @Input() emptyMessage = 'Nenhum registro encontrado.';
  @Input() expandedKey: string | number | null = null;

  @ContentChildren(ColumnDirective) private columnList!: QueryList<ColumnDirective<T>>;
  @ContentChild('expanded') expandedTemplate?: TemplateRef<ColumnContext<T>>;

  readonly skeletonRows = Array.from({ length: 5 });

  get columns(): ColumnDirective<T>[] {
    return this.columnList?.toArray() ?? [];
  }

  isExpanded(row: T): boolean {
    return this.expandedKey !== null && this.rowKey(row) === this.expandedKey;
  }

  headerClass(col: ColumnDirective<T>): string {
    const align = col.align === 'right' ? 'text-right' : 'text-left';
    return `px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground ${align} ${col.width}`;
  }

  cellClass(col: ColumnDirective<T>): string {
    const align = col.align === 'right' ? 'text-right' : 'text-left';
    return `px-4 py-3 align-middle ${align} ${col.width}`;
  }

  rowClass(row: T): string {
    const base = 'border-b border-border/60 transition-colors hover:bg-secondary/50';
    return this.isExpanded(row) ? `${base} bg-secondary/40` : base;
  }
}
