import { Component, InputSignal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Gift } from '../../models/gift.model';

@Component({
    selector: 'app-gift-photo-card',
    templateUrl: './gift-photo-card.component.html',
    styleUrl: './gift-photo-card.component.scss',
    imports: [CommonModule]
})
export class GiftPhotoCardComponent {
  public readonly gift: InputSignal<Gift> = input.required<Gift>();
}
