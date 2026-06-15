import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SeletorMetodoComponent } from './components/seletor-metodo/seletor-metodo.component';
import { CartaoFormComponent } from './components/cartao-form/cartao-form.component';
import { PixDisplayComponent } from './components/pix-display/pix-display.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, SeletorMetodoComponent, CartaoFormComponent, PixDisplayComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  activeMethod: 'credit_card' | 'debit_card' | 'pix' | null = null;
  orderId = '';
  totalAmount = 0;

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orderId = (params['orderId'] as string) ?? '';
      this.totalAmount = Number(params['amount'] ?? 0);
    });
  }
}
