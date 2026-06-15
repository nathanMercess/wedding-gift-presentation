import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  Input,
  OnInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { Router } from '@angular/router';
import { PaymentService } from '../../services/pagamento.service';
import { CardData } from '../../models/dados-cartao.model';
import { CardPaymentDtoModel } from '../../models/cartao-pagamento-dto.model';

function expirationDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value) return null;
    const match = value.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return { format: true };
    const month = parseInt(match[1], 10);
    if (month < 1 || month > 12) return { invalidMonth: true };
    return null;
  };
}

function cardNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const digits = (control.value as string)?.replace(/\s/g, '') ?? '';
    return /^\d{16}$/.test(digits) ? null : { invalidCardNumber: true };
  };
}

@Component({
  selector: 'app-cartao-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cartao-form.component.html',
  styleUrl: './cartao-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartaoFormComponent implements OnInit {
  @Input() metodo: 'credit_card' | 'debit_card' = 'credit_card';
  @Input() orderId = '';
  @Input() totalAmount = 0;

  form!: FormGroup;
  loading = false;
  error = '';
  readonly installments = Array.from({ length: 12 }, (_, i) => i + 1);

  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor(
    private readonly fb: FormBuilder,
    private readonly paymentService: PaymentService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      cardNumber:     ['', [Validators.required, cardNumberValidator()]],
      expirationDate: ['', [Validators.required, expirationDateValidator()]],
      cvv:            ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      installments:   [1]
    });
  }

  get isCreditCard(): boolean {
    return this.metodo === 'credit_card';
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();

    const { cardNumber, expirationDate, cvv, installments } = this.form.value as {
      cardNumber: string;
      expirationDate: string;
      cvv: string;
      installments: number;
    };

    const [month, year] = expirationDate.split('/');

    const cardData: CardData = {
      cardNumber:      cardNumber.replace(/\s/g, ''),
      expirationMonth: month,
      expirationYear:  year,
      cvv
    };

    let token: string;
    try {
      token = await this.paymentService.tokenizeCard(cardData);
    } catch {
      this.error = 'Error processing card data. Please check the information and try again.';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    const dto: CardPaymentDtoModel = {
      orderId:      this.orderId,
      cardToken:    token,
      amount:       this.totalAmount,
      installments: this.isCreditCard ? (installments ?? 1) : 1,
      method:       this.metodo
    };

    this.paymentService.payWithCard(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.status === 'approved') {
            this.router.navigate(['/sucesso']);
            return;
          }
          this.error = response.status === 'declined'
            ? 'Payment declined by card issuer.'
            : (response.message ?? 'Error processing payment. Please try again.');
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.error = 'Error processing payment. Please try again.';
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }
}
