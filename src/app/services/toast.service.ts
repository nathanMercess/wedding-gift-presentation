import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warn' | 'info';

export interface ToastItem {
  id: number;
  type: ToastType;
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  public readonly items = signal<ToastItem[]>([]);

  public success(detail: string, summary: string = 'Sucesso'): void {
    this.push('success', summary, detail, 4000);
  }

  public error(detail: string, summary: string = 'Erro'): void {
    this.push('error', summary, detail, 6000);
  }

  public warn(detail: string, summary: string = 'Atenção'): void {
    this.push('warn', summary, detail, 5000);
  }

  public info(detail: string, summary: string = 'Informação'): void {
    this.push('info', summary, detail, 4000);
  }

  public dismiss(id: number): void {
    this.items.update(list => list.filter(t => t.id !== id));
  }

  private push(type: ToastType, title: string, message: string, ms: number): void {
    const id = this.nextId++;
    this.items.update(list => [...list, { id, type, title, message }]);
    setTimeout(() => this.dismiss(id), ms);
  }
}
