import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderLookupStatus } from '../../checkout/enums/order-lookup-status.enum';
import { PaymentService } from '../../checkout/services/payment.service';

@Component({
  standalone: true,
  selector: 'app-order-lookup',
  templateUrl: './order-lookup.component.html',
  styleUrl: './order-lookup.component.scss',
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderLookupComponent implements OnInit {
  public orderId: string = '';
  public email: string = '';
  public token: string = '';
  public submitted: boolean = false;

  public constructor(public readonly paymentService: PaymentService, public readonly route: ActivatedRoute) {}

  public ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';

    if (this.token)
      this.paymentService.consumeOrderLookup(this.token);
  }

  public get statusLabel(): string {
    const status: OrderLookupStatus | undefined = this.paymentService.orderLookupState().response?.status;

    if (status === OrderLookupStatus.Approved)
      return 'Aprovado';

    if (status === OrderLookupStatus.Pending)
      return 'Pendente';

    if (status === OrderLookupStatus.Refunded)
      return 'Estornado';

    return 'Não aprovado';
  }

  public lookup(): void {
    this.submitted = true;

    if (!this.orderId.trim() || !this.email.trim())
      return;

    this.paymentService.requestOrderLookup(this.orderId.trim(), this.email.trim());
  }
}
