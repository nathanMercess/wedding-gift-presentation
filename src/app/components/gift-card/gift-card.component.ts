import { Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
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
  public readonly image: InputSignal<string> = input<string>('');
  public readonly name: InputSignal<string> = input<string>('');
  public readonly price: InputSignal<number> = input<number>(0);
  public readonly raised: InputSignal<number> = input<number>(0);
  public readonly total: InputSignal<number> = input<number>(0);
  public readonly presentClick: OutputEmitterRef<void> = output<void>();

  public isHovered: boolean = false;

  public get progressPercent(): number {
    return Math.min((this.raised() / this.total()) * 100, 100);
  }

  public onPresent(): void {
    this.presentClick.emit();
  }

  public onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.background = '#F7F0EA';
  }
}
