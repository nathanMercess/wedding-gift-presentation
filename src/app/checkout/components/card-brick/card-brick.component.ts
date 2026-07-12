import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, InputSignal, NgZone, OnDestroy, OutputEmitterRef, effect, input, output } from '@angular/core';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import { environment } from '../../../../environments/environment';
import { MP_CARD_BRICK_CUSTOMIZATION } from '../../constants/mp-card-brick-style.constant';
import { MP_DECLINE_FALLBACK, MP_DECLINE_MESSAGES } from '../../constants/mp-decline-messages.constant';
import { PaymentMethod } from '../../enums/payment-method.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';
import { CardBrickConfig } from '../../models/card-brick-config.model';
import { CardPaymentDto } from '../../models/card-payment-dto.model';
import { PaymentResult } from '../../models/payment-result.model';
import { PaymentResponse } from '../../models/payment-response.model';
import { PaymentState } from '../../models/payment-state.model';
import { PaymentService } from '../../services/payment.service';
import { ApiErrorCode } from '../../../enums/api-error-code.enum';
import { ToastService } from '../../../services/toast.service';
import { ColorUtil } from '../../../utils/color.util';

interface CardBrickController {
  unmount(): void;
}

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
  public readonly paymentResolved: OutputEmitterRef<PaymentResult> = output<PaymentResult>();

  public readonly ApiErrorCode: typeof ApiErrorCode = ApiErrorCode;
  public brickReady: boolean = false;
  public error: string = '';

  private brickController: CardBrickController = { unmount: (): void => {} };
  private brickMounted: boolean = false;
  private pendingResolve: () => void = (): void => {};
  private pendingReject: (reason?: unknown) => void = (): void => {};
  private hasPendingSubmission: boolean = false;
  private loadTimeoutHandle: number = 0;

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

  public retryLoad(): void {
    if (this.brickMounted)
      this.brickController.unmount();

    this.brickController = { unmount: (): void => {} };
    this.brickMounted = false;
    this.error = '';
    this.brickReady = false;
    this.loadBrick();
  }

  public ngOnDestroy(): void {
    this.clearLoadTimeout();

    if (this.brickMounted)
      this.brickController.unmount();
  }

  private showError(code: string, detail: string): void {
    this.error = code;
    this.toastService.error(detail, 'Erro no pagamento');
  }

  private async loadBrick(): Promise<void> {
    this.loadTimeoutHandle = window.setTimeout((): void => {
      this.ngZone.run((): void => {
        this.error = 'O formulário de pagamento está demorando para carregar. Verifique sua conexão.';
      });
    }, 15000);

    try {
      await loadMercadoPago();
      const mercadoPago = new (window as any)['MercadoPago'](environment.mercadoPagoPublicKey, { locale: 'pt-BR' });
      const bricksBuilder = mercadoPago.bricks();
      const cfg: CardBrickConfig = this.config();

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
            maxInstallments: cfg.cardType === PaymentMethod.CreditCard ? cfg.maxInstallments : 1,
          },
        },
        callbacks: {
          onReady: (): void => {
            this.clearLoadTimeout();
            this.ngZone.run((): void => { this.brickReady = true; });
          },
          onSubmit: (formData: unknown): Promise<void> => this.onSubmit(formData),
          onError: (err: unknown): void => {
            console.error('Card Brick error:', err);
            this.clearLoadTimeout();
            this.ngZone.run((): void => {
              this.showError('brick_error', 'Erro ao carregar o formulário de pagamento. Tente novamente.');
            });
          },
        },
      }) as CardBrickController;
      this.brickMounted = true;
    } catch {
      this.clearLoadTimeout();
      this.showError('brick_load_error', 'Falha ao carregar o formulário de pagamento. Verifique sua conexão e tente novamente.');
    }
  }

  private clearLoadTimeout(): void {
    if (this.loadTimeoutHandle === 0)
      return;

    clearTimeout(this.loadTimeoutHandle);
    this.loadTimeoutHandle = 0;
  }

  private brandColorOverrides(): Record<string, string> {
    const primary: string = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    const rgb: { r: number; g: number; b: number } | null = ColorUtil.parseHex(primary);

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
    return new Promise<void>((resolve: () => void, reject: (reason?: unknown) => void): void => {
      this.pendingResolve = resolve;
      this.pendingReject = reject;
      this.hasPendingSubmission = true;

      const cfg: CardBrickConfig = this.config();
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
        issuerId: formData.issuer_id,
        deviceId: (window as any).MP_DEVICE_SESSION_ID,
        installments: formData.installments ?? 1,
        method: cfg.cardType,
        payerEmail: payer.email ?? cfg.payerEmail,
        payerDocType: identification.type ?? 'CPF',
        payerDocNumber: identification.number ?? '',
      };

      this.ngZone.run((): void => this.paymentService.payWithCard(dto));
    });
  }

  private clearPending(): void {
    this.pendingResolve = (): void => {};
    this.pendingReject = (): void => {};
    this.hasPendingSubmission = false;
  }

  private handlePaymentState(state: PaymentState): void {
    if (state.submitting || !this.hasPendingSubmission)
      return;

    this.ngZone.run((): void => {
      if (state.error) {
        this.pendingReject(new Error('network_error'));
        this.showError(ApiErrorCode.ProviderError, state.error);
        this.clearPending();
        return;
      }

      if (!state.hasResponse) {
        this.clearPending();
        return;
      }

      const response = state.response;

      if (response.status === PaymentStatus.Approved || response.status === PaymentStatus.Processed) {
        this.pendingResolve();
        this.paymentResolved.emit(this.toPaymentResult(response));
        this.paymentApproved.emit();
        this.clearPending();
        return;
      }

      if (response.status === PaymentStatus.InProcess || response.status === PaymentStatus.Pending) {
        this.pendingResolve();
        this.toastService.info('Pagamento em análise pelo emissor. Sua contribuição será confirmada em instantes.', 'Pagamento recebido');
        this.paymentResolved.emit(this.toPaymentResult(response));
        this.clearPending();
        return;
      }

      this.pendingReject(new Error(response.statusDetail ?? 'declined'));
      this.showError(response.errorCode ?? ApiErrorCode.PaymentDeclined, MP_DECLINE_MESSAGES[response.statusDetail ?? ''] ?? MP_DECLINE_FALLBACK);
      this.clearPending();
    });
  }

  private toPaymentResult(response: PaymentResponse): PaymentResult {
    const cfg: CardBrickConfig = this.config();

    return {
      orderId: response.orderId ?? cfg.orderId,
      amount: response.amount ?? cfg.amount,
      giftId: response.giftId ?? cfg.giftId,
      giftName: response.giftName ?? cfg.giftName,
      contributorName: response.contributorName ?? cfg.contributorName,
      message: response.message ?? cfg.message,
      method: cfg.cardType,
      status: response.status,
      statusDetail: response.statusDetail,
      mpOrderId: response.mpOrderId,
      paidAt: response.paidAt ?? response.updatedAt ?? new Date().toISOString(),
      contributionCreated: response.contributionCreated ?? false,
    };
  }
}
