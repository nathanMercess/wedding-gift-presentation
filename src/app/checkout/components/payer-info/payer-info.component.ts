import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

export interface PayerData {
  email: string;
  docType: string;
  docNumber: string;
}

function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const digits = (control.value as string)?.replace(/\D/g, '') ?? '';
    return digits.length === 11 ? null : { invalidCpf: true };
  };
}

@Component({
  selector: 'app-payer-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payer-info.component.html',
  styleUrl: './payer-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayerInfoComponent {
  @Output() payerDataConfirmed = new EventEmitter<PayerData>();

  readonly form: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, cpfValidator()]]
    });
  }

  onCpfInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let digits = input.value.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 9) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    } else if (digits.length > 6) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }
    this.form.get('cpf')!.setValue(formatted, { emitEvent: false });
  }

  confirm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawCpf = (this.form.value.cpf as string).replace(/\D/g, '');

    this.payerDataConfirmed.emit({
      email: this.form.value.email as string,
      docType: 'CPF',
      docNumber: rawCpf
    });
  }
}
