import { Component, Directive, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const CONTROL =
  'h-9 w-full border border-border bg-background px-3 font-mono text-[13px] text-foreground transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none disabled:bg-muted disabled:text-muted-foreground read-only:bg-muted read-only:text-muted-foreground';

/**
 * Base de ControlValueAccessor compartilhada pelos campos.
 * Permite usar `[(ngModel)]` / `formControlName` nos componentes de formulário.
 * O decorator `@Directive()` é exigido pelo Angular em classes-base que usam
 * `@Input`/CVA, mesmo sem seletor próprio.
 */
@Directive()
abstract class FieldBase implements ControlValueAccessor {
  @Input({ required: true }) label!: string;
  @Input() hint?: string;
  @Input() readonly = false;
  @Input() disabled = false;

  value = '';
  protected onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly control = CONTROL;

  writeValue(value: string): void {
    this.value = value ?? '';
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

/** Campo de texto com label + hint. */
@Component({
  selector: 'app-text-field',
  standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TextFieldComponent), multi: true }],
  template: `
    <label class="flex flex-col gap-1.5">
      <span class="flex items-baseline justify-between">
        <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{{ label }}</span>
        @if (hint) {
          <span class="font-mono text-[10px] text-muted-foreground/70">{{ hint }}</span>
        }
      </span>
      <input
        [type]="type"
        [class]="control"
        [value]="value"
        [readOnly]="readonly"
        [disabled]="disabled"
        [attr.placeholder]="placeholder"
        [attr.autocomplete]="autocomplete"
        (input)="handleInput($event)"
        (blur)="onTouched()"
      />
    </label>
  `,
})
export class TextFieldComponent extends FieldBase {
  @Input() type: 'text' | 'password' = 'text';
  @Input() placeholder?: string;
  @Input() autocomplete?: string;
  /** Força maiúsculas ao digitar (ex.: código de unidade). */
  @Input() uppercase = false;

  handleInput(event: Event): void {
    let v = (event.target as HTMLInputElement).value;
    if (this.uppercase) {
      v = v.toUpperCase();
      (event.target as HTMLInputElement).value = v;
    }
    this.value = v;
    this.onChange(v);
  }
}

/** Campo de seleção; as `<option>` são projetadas via `<ng-content>`. */
@Component({
  selector: 'app-select-field',
  standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectFieldComponent), multi: true }],
  template: `
    <label class="flex flex-col gap-1.5">
      <span class="flex items-baseline justify-between">
        <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{{ label }}</span>
        @if (hint) {
          <span class="font-mono text-[10px] text-muted-foreground/70">{{ hint }}</span>
        }
      </span>
      <select
        [class]="control + ' appearance-none pr-8'"
        [value]="value"
        [disabled]="disabled"
        (change)="handleChange($event)"
        (blur)="onTouched()"
      >
        <ng-content />
      </select>
    </label>
  `,
})
export class SelectFieldComponent extends FieldBase {
  handleChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    this.value = v;
    this.onChange(v);
  }
}
