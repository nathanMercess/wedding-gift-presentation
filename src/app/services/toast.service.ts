import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class ToastService {
  public constructor(private readonly messageService: MessageService) {}

  public success(detail: string, summary: string = 'Sucesso'): void {
    this.messageService.add({ severity: 'success', summary, detail, life: 4000 });
  }

  public error(detail: string, summary: string = 'Erro'): void {
    this.messageService.add({ severity: 'error', summary, detail, life: 6000 });
  }

  public warn(detail: string, summary: string = 'Atenção'): void {
    this.messageService.add({ severity: 'warn', summary, detail, life: 5000 });
  }

  public info(detail: string, summary: string = 'Informação'): void {
    this.messageService.add({ severity: 'info', summary, detail, life: 4000 });
  }
}
