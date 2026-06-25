import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, WritableSignal, signal } from '@angular/core';
import { Observable, finalize, throwError, timeout } from 'rxjs';
import { EndpointsUrls } from '../../constants/api-endpoints';
import { ApiResponse } from '../../models/api-response.model';
import { ApiResponseUtil } from '../../utils/api-response.util';
import { HttpErrorUtil } from '../../utils/http-error';
import { EMPTY_PAYMENT_RESPONSE } from '../constants/empty-payment-response.constant';
import { CardPaymentDto } from '../models/card-payment-dto.model';
import { PaymentResponse } from '../models/payment-response.model';
import { PaymentState } from '../models/payment-state.model';
import { PaymentStatusState } from '../models/payment-status-state.model';
import { PixPaymentDto } from '../models/pix-payment-dto.model';

const PAYMENT_TIMEOUT_MS = 25000;

@Injectable({ providedIn: 'root' })
export class PaymentService {
  public readonly paymentState: WritableSignal<PaymentState> = signal<PaymentState>({
    submitting: false,
    hasResponse: false,
    response: EMPTY_PAYMENT_RESPONSE,
    error: '',
  });

  public readonly statusState: WritableSignal<PaymentStatusState> = signal<PaymentStatusState>({
    hasResponse: false,
    response: EMPTY_PAYMENT_RESPONSE,
    error: '',
  });

  public constructor(public readonly http: HttpClient, public readonly endpointsUrls: EndpointsUrls) {}

  public payWithCard(dto: CardPaymentDto): void {
    this.patchPaymentState({ submitting: true, hasResponse: false, response: EMPTY_PAYMENT_RESPONSE, error: '' });

    this.http.post<ApiResponse<PaymentResponse>>(this.endpointsUrls.paymentCard, dto)
      .pipe(
        timeout({ each: PAYMENT_TIMEOUT_MS, with: (): Observable<never> => throwError((): HttpErrorResponse => new HttpErrorResponse({ status: 0, statusText: 'Timeout' })) }),
        ApiResponseUtil.data<PaymentResponse>('Erro ao processar o pagamento. Tente novamente.'),
        finalize((): void => this.patchPaymentState({ submitting: false })),
      )
      .subscribe({
        next: (response: PaymentResponse): void => {
          this.patchPaymentState({ hasResponse: true, response });
        },
        error: (err: HttpErrorResponse): void => {
          this.patchPaymentState({ error: HttpErrorUtil.extract(err, 'Erro ao processar o pagamento. Tente novamente.') });
        },
      });
  }

  public payWithPix(dto: PixPaymentDto): void {
    this.patchPaymentState({ submitting: true, hasResponse: false, response: EMPTY_PAYMENT_RESPONSE, error: '' });

    this.http.post<ApiResponse<PaymentResponse>>(this.endpointsUrls.paymentPix, dto)
      .pipe(
        timeout({ each: PAYMENT_TIMEOUT_MS, with: (): Observable<never> => throwError((): HttpErrorResponse => new HttpErrorResponse({ status: 0, statusText: 'Timeout' })) }),
        ApiResponseUtil.data<PaymentResponse>('Erro ao gerar o PIX. Tente novamente.'),
        finalize((): void => this.patchPaymentState({ submitting: false })),
      )
      .subscribe({
        next: (response: PaymentResponse): void => {
          this.patchPaymentState({ hasResponse: true, response });
        },
        error: (err: HttpErrorResponse): void => {
          this.patchPaymentState({ error: HttpErrorUtil.extract(err, 'Erro ao gerar o PIX. Tente novamente.') });
        },
      });
  }

  public checkStatus(mpOrderId: string): void {
    this.http.get<ApiResponse<PaymentResponse>>(this.endpointsUrls.paymentStatus(mpOrderId))
      .pipe(ApiResponseUtil.data<PaymentResponse>('Erro ao consultar status do pagamento.'))
      .subscribe({
        next: (response: PaymentResponse): void => {
          this.patchStatusState({ hasResponse: true, response, error: '' });
        },
        error: (err: HttpErrorResponse): void => {
          this.patchStatusState({ error: HttpErrorUtil.extract(err, 'Erro ao consultar status do pagamento.') });
        },
      });
  }

  public patchPaymentState(partialState: Partial<PaymentState>): void {
    this.paymentState.update((currentState: PaymentState): PaymentState => ({ ...currentState, ...partialState }));
  }

  public patchStatusState(partialState: Partial<PaymentStatusState>): void {
    this.statusState.update((currentState: PaymentStatusState): PaymentStatusState => ({ ...currentState, ...partialState }));
  }
}
