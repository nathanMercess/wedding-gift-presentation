import { Injectable, WritableSignal, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { EndpointsUrls } from '../../constants/api-endpoints';
import { CardPaymentDto } from '../models/card-payment-dto.model';
import { PixPaymentDto } from '../models/pix-payment-dto.model';
import { PaymentResponse } from '../models/payment-response.model';
import { PaymentState } from '../models/payment-state.model';
import { PaymentStatusState } from '../models/payment-status-state.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  public readonly paymentState: WritableSignal<PaymentState> = signal<PaymentState>({
    submitting: false,
    response: null,
    error: '',
  });
  
  public readonly statusState: WritableSignal<PaymentStatusState> = signal<PaymentStatusState>({
    response: null,
    error: '',
  });

  public constructor(public readonly http: HttpClient, public readonly endpointsUrls: EndpointsUrls) { }

  public payWithCard(dto: CardPaymentDto): void {
    this.patchPaymentState({ submitting: true, response: null, error: '' });

    this.http.post<PaymentResponse>(this.endpointsUrls.paymentCard, dto).pipe(finalize((): void => this.patchPaymentState({ submitting: false }))).subscribe({
      next: (response: PaymentResponse): void => {
        this.patchPaymentState({ response });
      },
      error: (err: HttpErrorResponse): void => {
        const error = err.status === 0
          ? 'Não foi possível conectar. Verifique sua internet e tente novamente.'
          : 'Erro ao processar o pagamento. Tente novamente.';
        this.patchPaymentState({ error });
      }
    });
  }

  public payWithPix(dto: PixPaymentDto): void {
    this.patchPaymentState({ submitting: true, response: null, error: '' });

    this.http.post<PaymentResponse>(this.endpointsUrls.paymentPix, dto).pipe(finalize((): void => this.patchPaymentState({ submitting: false }))).subscribe({
      next: (response: PaymentResponse): void => {
        this.patchPaymentState({ response });
      },
      error: (err: HttpErrorResponse): void => {
        const error = err.status === 0
          ? 'Não foi possível conectar. Verifique sua internet e tente novamente.'
          : 'Erro ao gerar o PIX. Tente novamente.';
        this.patchPaymentState({ error });
      }
    });
  }

  public checkStatus(mpOrderId: string): void {
    this.http.get<PaymentResponse>(this.endpointsUrls.paymentStatus(mpOrderId)).subscribe({
      next: (response: PaymentResponse): void => {
        this.patchStatusState({ response, error: '' });
      },
      error: (err: HttpErrorResponse): void => {
        const error = err.status === 0
          ? 'Sem conexão para consultar o status. Tentando novamente...'
          : 'Erro ao consultar status do pagamento.';
        this.patchStatusState({ error });
      }
    });
  }

  public patchPaymentState(partialState: Partial<PaymentState>): void {
    this.paymentState.update((currentState: PaymentState): PaymentState => ({ ...currentState, ...partialState }));
  }

  public patchStatusState(partialState: Partial<PaymentStatusState>): void {
    this.statusState.update((currentState: PaymentStatusState): PaymentStatusState => ({ ...currentState, ...partialState }));
  }
}
