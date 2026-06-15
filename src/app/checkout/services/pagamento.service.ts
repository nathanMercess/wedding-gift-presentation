import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EndpointsUrls } from '../../constants/api-endpoints';
import { CardData } from '../models/dados-cartao.model';
import { CardPaymentDtoModel } from '../models/cartao-pagamento-dto.model';
import { PixPaymentDtoModel } from '../models/pix-pagamento-dto.model';
import { PaymentResponse } from '../models/pagamento-response.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {

  constructor(
    private readonly http: HttpClient,
    private readonly endpoints: EndpointsUrls
  ) {}

  /**
   * Tokenizes the card directly in the browser via IPay.js.
   * Card data never reaches the backend — only the token is sent.
   */
  tokenizeCard(data: CardData): Promise<string> {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ipay = (window as any)['IPay'];

      if (!ipay) {
        reject(new Error('IPay.js not loaded. Check the script in index.html.'));
        return;
      }

      ipay.tokenize(
        {
          number:           data.cardNumber.replace(/\s/g, ''),
          expiration_month: data.expirationMonth,
          expiration_year:  data.expirationYear,
          cvv:              data.cvv
        },
        (err: unknown, token: string) => {
          if (err) {
            reject(new Error('Card tokenization error: ' + JSON.stringify(err)));
          } else {
            resolve(token);
          }
        }
      );
    });
  }

  payWithCard(dto: CardPaymentDtoModel): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(this.endpoints.paymentCard, dto);
  }

  payWithPix(dto: PixPaymentDtoModel): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(this.endpoints.paymentPix, dto);
  }

  getPaymentStatus(nsu: string): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(this.endpoints.paymentStatus(nsu));
  }
}
