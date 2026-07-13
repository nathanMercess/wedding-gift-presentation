import { Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentResult } from '../../checkout/models/payment-result.model';
import { PaymentStatusUtil } from '../../checkout/utils/payment-status.util';
import { ButtonComponent } from '../button/button.component';
import { ButtonVariant } from '../../enums/button-variant.enum';
import { ButtonType } from '../../enums/button-type.enum';

@Component({
  standalone: true,
  selector: 'app-gift-success-step',
  templateUrl: './gift-success-step.component.html',
  styleUrl: './gift-success-step.component.scss',
  imports: [CommonModule, ButtonComponent],
})
export class GiftSuccessStepComponent {
  public readonly result: InputSignal<PaymentResult> = input.required<PaymentResult>();
  public readonly coupleName: InputSignal<string> = input.required<string>();

  public readonly close: OutputEmitterRef<void> = output<void>();
  public readonly presentAnother: OutputEmitterRef<void> = output<void>();

  public readonly ButtonVariant: typeof ButtonVariant = ButtonVariant;
  public readonly ButtonType: typeof ButtonType = ButtonType;
  public readonly PaymentStatusUtil: typeof PaymentStatusUtil = PaymentStatusUtil;

  public receiptCopied: boolean = false;

  public get statusLabel(): string {
    return PaymentStatusUtil.label(this.result().status);
  }

  public get statusMessage(): string {
    return PaymentStatusUtil.message(this.result().status, this.coupleName());
  }

  public get isApproved(): boolean {
    return PaymentStatusUtil.isApproved(this.result().status);
  }

  public get dateLabel(): string {
    return this.isApproved ? 'Data do pagamento' : 'Atualizado em';
  }

  public get amountLabel(): string {
    return this.isApproved ? 'Valor pago' : 'Valor da contribuição';
  }

  public get copyLabel(): string {
    if (this.receiptCopied)
      return this.isApproved ? 'Comprovante copiado' : 'Resumo copiado';

    return this.isApproved ? 'Copiar comprovante' : 'Copiar resumo';
  }

  public get receiptFileName(): string {
    return `${this.isApproved ? 'comprovante' : 'resumo'}-${this.result().orderId}.txt`;
  }

  public get receiptText(): string {
    const result: PaymentResult = this.result();
    const lines: string[] = [
      `Pedido: ${result.orderId}`,
      `Status: ${this.statusLabel}`,
      `Presente: ${result.giftName}`,
      `Valor: ${this.formatCurrency(result.amount)}`,
      `Nome: ${result.contributorName}`,
      `${this.dateLabel}: ${this.formatDate(result.paidAt)}`,
    ];

    if (result.mpOrderId)
      lines.push(`Referencia: ${result.mpOrderId}`);

    if (result.message)
      lines.push(`Mensagem: ${result.message}`);

    return lines.join('\n');
  }

  public copyReceipt(): void {
    navigator.clipboard.writeText(this.receiptText).then((): void => {
      this.receiptCopied = true;
      setTimeout((): void => { this.receiptCopied = false; }, 2000);
    });
  }

  public downloadReceipt(): void {
    const blob = new Blob([this.receiptText], { type: 'text/plain;charset=utf-8' });
    const url: string = URL.createObjectURL(blob);
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = url;
    link.download = this.receiptFileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  private formatDate(value: string): string {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
  }
}
