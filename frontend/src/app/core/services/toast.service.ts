import { Injectable, signal } from '@angular/core';

export type ToastTipo = 'sucesso' | 'erro' | 'info';

export interface Toast {
  id: number;
  tipo: ToastTipo;
  mensagem: string;
}

/**
 * Notificações efêmeras (toasts). Estado reativo via signal, consumido pelo
 * <app-toast-container />. Cada toast some sozinho após alguns segundos.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  readonly toasts = signal<Toast[]>([]);

  sucesso(mensagem: string): void {
    this.push('sucesso', mensagem);
  }

  erro(mensagem: string): void {
    this.push('erro', mensagem);
  }

  info(mensagem: string): void {
    this.push('info', mensagem);
  }

  remover(id: number): void {
    this.toasts.update((lista) => lista.filter((t) => t.id !== id));
  }

  private push(tipo: ToastTipo, mensagem: string): void {
    const id = ++this.seq;
    this.toasts.update((lista) => [...lista, { id, tipo, mensagem }]);
    setTimeout(() => this.remover(id), 3800);
  }
}
