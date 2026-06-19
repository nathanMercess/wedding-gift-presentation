import { AfterViewInit, Component, InputSignal, NgZone, OnDestroy, OutputEmitterRef, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import { environment } from '../../../../environments/environment';
import { PaymentService } from '../../services/payment.service';
import { PaymentState } from '../../models/payment-state.model';
import { CardPaymentDto } from '../../models/card-payment-dto.model';
import { CardBrickConfig } from '../../models/card-brick-config.model';
import { PaymentMethod } from '../../enums/payment-method.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';
import { MP_CARD_BRICK_CUSTOMIZATION } from '../../constants/mp-card-brick-style.constant';
import { PAYMENT_ERROR_CODES } from '../../constants/payment-error-codes.constant';
import { MP_DECLINE_FALLBACK, MP_DECLINE_MESSAGES } from '../../constants/mp-decline-messages.constant';
import { ColorUtil } from '../../../utils/color.util';
import { ToastService } from '../../../services/toast.service';

@Component({
  standalone: true,
  selector: 'app-card-brick',
  templateUrl: './card-brick.component.html',
  styleUrl: './card-brick.component.scss',
  imports: [CommonModule],
})
export class CardBrickComponent implements AfterViewInit, OnDestroy {
  public readonly config: InputSignal<CardBrickConfig> = input.required<CardBrickConfig>();
  public readonly paymentApproved: OutputEmitterRef<void> = output<void>();

  public readonly PAYMENT_ERROR_CODES: typeof PAYMENT_ERROR_CODES = PAYMENT_ERROR_CODES;
  public brickReady: boolean = false;
  public error: string = '';

  private brickController: any = null;
  private pendingResolve: (() => void) | null = null;
  private pendingReject: ((reason?: unknown) => void) | null = null;
  private loadTimeoutHandle: ReturnType<typeof setTimeout> | null = null;

  public constructor(
    public readonly paymentService: PaymentService,
    public readonly toastService: ToastService,
    private readonly ngZone: NgZone,
  ) {
    effect((): void => this.handlePaymentState(this.paymentService.paymentState()), { allowSignalWrites: true });
  }

  public ngAfterViewInit(): void {
    this.loadBrick();
  }

  private showError(code: string, detail: string): void {
    this.error = code;
    this.toastService.error(detail, 'Erro no pagamento');
  }

  public retryLoad(): void {
    this.brickController?.unmount();
    this.brickController = null;
    this.error = '';
    this.brickReady = false;
    this.loadBrick();
  }

  private async loadBrick(): Promise<void> {
    this.loadTimeoutHandle = setTimeout(() => {
      this.ngZone.run(() => {
        this.error = 'O formulário de pagamento está demorando para carregar. Verifique sua conexão.';
      });
    }, 15000);

    try {
      await loadMercadoPago();
      const mp = new (window as any)['MercadoPago'](environment.mercadoPagoPublicKey, { locale: 'pt-BR' });
      const bricksBuilder = mp.bricks();
      const cfg = this.config();

      this.brickController = await bricksBuilder.create('cardPayment', 'cardPaymentBrick_container', {
        initialization: {
          amount: cfg.amount,
          payer: { email: cfg.payerEmail },
        },
        customization: {
          ...MP_CARD_BRICK_CUSTOMIZATION,
          visual: {
            ...MP_CARD_BRICK_CUSTOMIZATION.visual,
            style: {
              ...MP_CARD_BRICK_CUSTOMIZATION.visual.style,
              customVariables: {
                ...MP_CARD_BRICK_CUSTOMIZATION.visual.style.customVariables,
                ...this.brandColorOverrides(),
              },
            },
          },
          paymentMethods: {
            creditCard: 'all',
            debitCard: 'all',
            maxInstallments: cfg.cardType === PaymentMethod.CreditCard ? 12 : 1,
          },
        },
        callbacks: {
          onReady: () => {
            this.clearLoadTimeout();
            this.ngZone.run(() => { this.brickReady = true; });
          },
          onSubmit: (formData: unknown) => this.onSubmit(formData),
          onError: (err: unknown) => {
            console.error('Card Brick error:', err);
            this.clearLoadTimeout();
            this.ngZone.run(() => {
              this.showError('brick_error', 'Erro ao carregar o formulário de pagamento. Tente novamente.');
            });
          },
        },
      });
    } catch {
      this.clearLoadTimeout();
      this.showError('brick_load_error', 'Falha ao carregar o formulário de pagamento. Verifique sua conexão e tente novamente.');
    }
  }

  private clearLoadTimeout(): void {
    if (this.loadTimeoutHandle !== null) {
      clearTimeout(this.loadTimeoutHandle);
      this.loadTimeoutHandle = null;
    }
  }

  private brandColorOverrides(): Record<string, string> {
    const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    const rgb = ColorUtil.parseHex(primary);

    if (!rgb)
      return {};

    return {
      baseColor: primary,
      baseColorFirstVariant: ColorUtil.lighten(primary, 0.15),
      baseColorSecondVariant: ColorUtil.darken(primary, 0.15),
      outlinePrimaryColor: primary,
    };
  }

  private onSubmit(formData: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.pendingResolve = resolve;
      this.pendingReject = reject;

      const cfg = this.config();
      const payer = formData.payer ?? {};
      const identification = payer.identification ?? {};

      const dto: CardPaymentDto = {
        giftId: cfg.giftId,
        contributorName: cfg.contributorName,
        message: cfg.message,
        orderId: cfg.orderId,
        amount: cfg.amount,
        cardToken: formData.token,
        paymentMethodId: formData.payment_method_id,
        installments: formData.installments ?? 1,
        method: cfg.cardType,
        payerEmail: payer.email ?? cfg.payerEmail,
        payerDocType: identification.type ?? 'CPF',
        payerDocNumber: identification.number ?? '',
      };

      this.ngZone.run(() => this.paymentService.payWithCard(dto));
    });
  }

  private clearPending(): void {
    this.pendingResolve = null;
    this.pendingReject = null;
  }

  private handlePaymentState(state: PaymentState): void {
    if (state.submitting || (!this.pendingResolve && !this.pendingReject))
      return;

    this.ngZone.run(() => {
      if (state.error) {
        this.pendingReject?.(new Error('network_error'));
        this.showError(PAYMENT_ERROR_CODES.PROVIDER_ERROR, 'Erro de comunicação com o provedor de pagamento. Tente novamente.');
        this.clearPending();
        return;
      }

      if (!state.response) {
        this.clearPending();
        return;
      }

      const response = state.response!;

      if (response.status === PaymentStatus.Approved || response.status === PaymentStatus.Processed) {
        this.pendingResolve?.();
        this.paymentApproved.emit();
        this.clearPending();
        return;
      }

      if (response.status === PaymentStatus.InProcess || response.status === PaymentStatus.Pending) {
        this.pendingResolve?.();
        this.toastService.info('Pagamento em análise pelo emissor. Sua contribuição será confirmada em instantes.', 'Pagamento recebido');
        this.paymentApproved.emit();
        this.clearPending();
        return;
      }

      this.pendingReject?.(new Error(response.statusDetail ?? 'declined'));
      this.showError(response.errorCode ?? PAYMENT_ERROR_CODES.PAYMENT_DECLINED, MP_DECLINE_MESSAGES[response.statusDetail ?? ''] ?? MP_DECLINE_FALLBACK);
      this.clearPending();
    });
  }

  public ngOnDestroy(): void {
    this.clearLoadTimeout();
    this.brickController?.unmount();
  }
}
