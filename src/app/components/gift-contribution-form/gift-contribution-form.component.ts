import { Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Gift } from '../../models/gift.model';
import { ButtonComponent } from '../button/button.component';
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
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
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
  public readonly form: FormGroup;

  public constructor(public readonly fb: FormBuilder) {
    this.form = this.fb.group({
      guestName: ['', [Validators.required, Validators.maxLength(120)]],
      guestMessage: ['', [Validators.maxLength(500)]],
      customAmount: ['', [this.amountValidator()]],
    });
  }

  public get isDirty(): boolean {
    const value = this.form.value;
    return (value.guestName ?? '').trim().length > 0 || `${value.customAmount ?? ''}`.trim().length > 0;
  }

  public get nameControl(): AbstractControl {
    return this.form.get('guestName')!;
  }

  public get amountControl(): AbstractControl {
    return this.form.get('customAmount')!;
  }

  public selectType(type: ContributionType): void {
    this.contributionType = type;
    this.amountControl.updateValueAndValidity();

    if (type === ContributionType.Full)
      this.amountControl.markAsUntouched();
  }

  public selectQuickAmount(value: number): void {
    this.amountControl.setValue(value.toString());
    this.amountControl.markAsTouched();
  }

  public getContributionAmount(): number {
    if (this.contributionType === ContributionType.Full)
      return this.remaining();

    return parseFloat(`${this.form.value.customAmount ?? ''}`.replace(',', '.')) || 0;
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const amount: number = this.getContributionAmount();

    if (amount <= 0 || amount > this.remaining()) {
      this.amountControl.markAsTouched();
      return;
    }

    this.submitted.emit({
      guestName: `${this.form.value.guestName ?? ''}`.trim(),
      guestMessage: `${this.form.value.guestMessage ?? ''}`.trim(),
      amount,
    });
  }

  private amountValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (this.contributionType !== ContributionType.Partial)
        return null;

      const raw: unknown = control.value;

      if (raw === null || raw === undefined || `${raw}`.trim() === '')
        return { required: true };

      const value: number = parseFloat(`${raw}`.replace(',', '.'));

      if (isNaN(value) || value <= 0)
        return { invalidAmount: true };

      if (value < this.minAmount())
        return { min: true };

      if (value > this.remaining())
        return { max: true };

      return null;
    };
  }
}
