import { Component, InputSignal, OnInit, OutputEmitterRef, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Gift } from '../../models/gift.model';
import { ButtonComponent } from '../button/button.component';
import { ButtonVariant } from '../../enums/button-variant.enum';
import { ButtonType } from '../../enums/button-type.enum';
import { ContributionType } from '../../enums/contribution-type.enum';
import { GiftDisplayMode } from '../../enums/gift-display-mode.enum';

export interface ContributionSubmitData {
  guestName: string;
  guestMessage: string;
  amount: number;
  contributionType: ContributionType;
  customAmount: string;
}

export interface ContributionFormData {
  guestName: string;
  guestMessage: string;
  contributionType: ContributionType;
  customAmount: string;
}

export const EMPTY_CONTRIBUTION_FORM_DATA: ContributionFormData = {
  guestName: '',
  guestMessage: '',
  contributionType: ContributionType.Full,
  customAmount: '',
};

@Component({
  standalone: true,
  selector: 'app-gift-contribution-form',
  templateUrl: './gift-contribution-form.component.html',
  styleUrl: './gift-contribution-form.component.scss',
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
})
export class GiftContributionFormComponent implements OnInit {
  public readonly gift: InputSignal<Gift> = input.required<Gift>();
  public readonly coupleName: InputSignal<string> = input<string>('');
  public readonly giftDisplayMode: InputSignal<GiftDisplayMode> = input<GiftDisplayMode>(GiftDisplayMode.Traditional);
  public readonly minAmount: InputSignal<number> = input.required<number>();
  public readonly remaining: InputSignal<number> = input.required<number>();
  public readonly availableQuickAmounts: InputSignal<number[]> = input<number[]>([]);
  public readonly initialData: InputSignal<ContributionFormData> = input<ContributionFormData>(EMPTY_CONTRIBUTION_FORM_DATA);
  public readonly hasInitialData: InputSignal<boolean> = input<boolean>(false);
  public readonly submitting: InputSignal<boolean> = input<boolean>(false);

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

  public ngOnInit(): void {
    if (!this.hasInitialData())
      return;

    const data: ContributionFormData = this.initialData();

    this.contributionType = data.contributionType;
    this.form.patchValue({
      guestName: data.guestName,
      guestMessage: data.guestMessage,
      customAmount: data.customAmount,
    });
    this.amountControl.updateValueAndValidity();
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

  public get fullContributionLabel(): string {
    if (this.giftDisplayMode() === GiftDisplayMode.PrivateUnlimited)
      return 'Valor do presente';

    if (this.gift().fullyFunded)
      return 'Valor do presente';

    return 'Valor restante';
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
    if (this.submitting())
      return;

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
      contributionType: this.contributionType,
      customAmount: `${this.form.value.customAmount ?? ''}`,
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
