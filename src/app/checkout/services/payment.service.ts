import { Injectable, WritableSignal, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
      error: (): void => {
        this.patchPaymentState({ error: 'Erro ao processar o pagamento. Tente novamente.' });
      }
    });
  }

  public payWithPix(dto: PixPaymentDto): void {
    this.patchPaymentState({ submitting: true, response: null, error: '' });

    this.http.post<PaymentResponse>(this.endpointsUrls.paymentPix, dto).pipe(finalize((): void => this.patchPaymentState({ submitting: false }))).subscribe({
      next: (response: PaymentResponse): void => {
        this.patchPaymentState({ response });
      },
      error: (): void => {
        this.patchPaymentState({ error: 'Erro ao gerar o PIX. Tente novamente.' });
      }
    });
  }

  public checkStatus(mpOrderId: string): void {
    this.http.get<PaymentResponse>(this.endpointsUrls.paymentStatus(mpOrderId)).subscribe({
      next: (response: PaymentResponse): void => {
        this.patchStatusState({ response, error: '' });
      },
      error: (): void => {
        this.patchStatusState({ error: 'Erro ao consultar status do pagamento.' });
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
