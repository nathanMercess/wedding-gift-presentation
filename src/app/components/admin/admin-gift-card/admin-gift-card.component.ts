import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Gift } from '../../../models/gift.model';

@Component({
  standalone: true,
  selector: 'app-admin-gift-card',
  templateUrl: './admin-gift-card.component.html',
  styleUrl: './admin-gift-card.component.scss',
  imports: [CommonModule],
})
export class AdminGiftCardComponent {
  @Input() public gift!: Gift;
  @Input() public isEditing: boolean = false;
  @Output() public readonly edit = new EventEmitter<Gift>();
  @Output() public readonly delete = new EventEmitter<Gift>();

  public getProgressPercent(): number {
    if (this.gift.total <= 0)
      return 0;

    return Math.min((this.gift.raised / this.gift.total) * 100, 100);
  }
}
