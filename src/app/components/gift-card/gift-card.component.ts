import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-gift-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './gift-card.component.html',
  styleUrl: './gift-card.component.scss'
})
export class GiftCardComponent {
  @Input() image: string = '';
  @Input() name: string = '';
  @Input() price: number = 0;
  @Input() raised: number = 0;
  @Input() total: number = 0;
  @Output() presentClick = new EventEmitter<void>();

  isHovered = false;

  get progressPercent(): number {
    return Math.min((this.raised / this.total) * 100, 100);
  }

  onPresent(): void {
    this.presentClick.emit();
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.background = '#F7F0EA';
  }
}
