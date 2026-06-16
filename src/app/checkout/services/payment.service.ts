import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EndpointsUrls } from '../../constants/api-endpoints';
import { CardPaymentDto } from '../models/card-payment-dto.model';
import { PixPaymentDto } from '../models/pix-payment-dto.model';
import { PaymentResponse } from '../models/payment-response.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  public constructor(public readonly http: HttpClient, public readonly endpoints: EndpointsUrls) { }

  public payWithCard(dto: CardPaymentDto): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(this.endpoints.paymentCard, dto);
  }

  public payWithPix(dto: PixPaymentDto): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(this.endpoints.paymentPix, dto);
  }

  public getStatus(mpOrderId: string): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(this.endpoints.paymentStatus(mpOrderId));
  }
}
