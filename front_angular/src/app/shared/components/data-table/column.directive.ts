import { Directive, inject, Input, TemplateRef } from '@angular/core';

/** Contexto tipado exposto às células: `let-row` recebe a linha. */
export interface ColumnContext<T> {
  $implicit: T;
}

/**
 * Descreve uma coluna do `app-data-table`. O corpo do `<ng-template appColumn>`
 * é o template da célula, renderizado pela tabela para cada linha.
 *
 * O array de linhas é passado em `[appColumn]` apenas como **âncora de tipo**:
 * ele deixa o `let-row` fortemente tipado sob `strictTemplates` (o valor em si é
 * ignorado — a tabela injeta cada linha via contexto).
 *
 * Ex.:
 * ```html
 * <ng-template [appColumn]="usuarios" header="Código" width="w-[110px]" let-row>
 *   {{ row.codigo }}
 * </ng-template>
 * ```
 * Substitui idiomaticamente o padrão de "render prop" do React (`render: (row) => ...`).
 */
@Directive({
  selector: 'ng-template[appColumn]',
  standalone: true,
})
export class ColumnDirective<T = unknown> {
  /** Âncora de tipo — recebe o mesmo array passado ao `app-data-table`. */
  @Input() appColumn?: readonly T[];
  @Input({ required: true }) header!: string;
  @Input() width = '';
  @Input() align: 'left' | 'right' = 'left';

  readonly template = inject<TemplateRef<ColumnContext<T>>>(TemplateRef);

  /** Type guard usado pelo template do DataTable para inferência do contexto. */
  static ngTemplateContextGuard<T>(
    _dir: ColumnDirective<T>,
    _ctx: unknown,
  ): _ctx is ColumnContext<T> {
    return true;
  }
}
