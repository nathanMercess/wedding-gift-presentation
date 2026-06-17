import { Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Gift } from '../../models/gift.model';
import { ButtonComponent } from '../button/button.component';
import { ToastService } from '../../services/toast.service';
import { ButtonVariant } from '../../enums/button-variant.enum';
import { ButtonType } from '../../enums/button-type.enum';
import { ContributionType } from '../../enums/contribution-type.enum';

export interface ContributionSubmitData {
  guestName: string;
  guestMessage: string;
  amount: number;
}

@Component({
  standalone: true,
  selector: 'app-gift-contribution-form',
  templateUrl: './gift-contribution-form.component.html',
  styleUrl: './gift-contribution-form.component.scss',
  imports: [CommonModule, FormsModule, ButtonComponent],
})
export class GiftContributionFormComponent {
  public readonly gift: InputSignal<Gift> = input.required<Gift>();
  public readonly coupleName: InputSignal<string> = input<string>('');
  public readonly minAmount: InputSignal<number> = input.required<number>();
  public readonly remaining: InputSignal<number> = input.required<number>();
  public readonly availableQuickAmounts: InputSignal<number[]> = input<number[]>([]);

  public readonly submitted: OutputEmitterRef<ContributionSubmitData> = output<ContributionSubmitData>();
  public readonly cancelled: OutputEmitterRef<void> = output<void>();

  public readonly ButtonVariant: typeof ButtonVariant = ButtonVariant;
  public readonly ButtonType: typeof ButtonType = ButtonType;
  public readonly ContributionType: typeof ContributionType = ContributionType;

  public contributionType: ContributionType = ContributionType.Full;
  public customAmount: string = '';
  public guestName: string = '';
  public guestMessage: string = '';

  public constructor(private readonly toastService: ToastService) {}

  public get isDirty(): boolean {
    return this.guestName.trim().length > 0 || this.customAmount.trim().length > 0;
  }

  public getContributionAmount(): number {
    if (this.contributionType === ContributionType.Full)
      return this.remaining();

    return parseFloat(this.customAmount) || 0;
  }

  public onSubmit(): void {
    const amount = this.getContributionAmount();

    if (!this.guestName.trim()) {
      this.toastService.error('Por favor, informe seu nome completo.', 'Campo obrigatório');
      return;
    }

    if (this.contributionType === ContributionType.Partial && amount < this.minAmount()) {
      this.toastService.error(
        `O valor mínimo de contribuição é R$ ${this.minAmount().toFixed(2).replace('.', ',')}.`,
        'Valor inválido',
      );
      return;
    }

    if (amount <= 0) {
      this.toastService.error('Informe um valor de contribuição válido.', 'Valor inválido');
      return;
    }

    if (amount > this.remaining()) {
      this.toastService.error(
        `O valor não pode ser maior que R$ ${this.remaining().toFixed(2).replace('.', ',')}.`,
        'Valor inválido',
      );
      return;
    }

    this.submitted.emit({ guestName: this.guestName, guestMessage: this.guestMessage, amount });
  }
}
