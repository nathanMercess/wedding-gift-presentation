import { Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { ButtonVariant } from '../../enums/button-variant.enum';
import { ButtonSize } from '../../enums/button-size.enum';

@Component({
  standalone: true,
  selector: 'app-gift-card',
  templateUrl: './gift-card.component.html',
  styleUrl: './gift-card.component.scss',
  imports: [CommonModule, ButtonComponent]
})
export class GiftCardComponent {

  //==CLAUDE==: não precisa de varios inputs separados, pode ter um input com a interface do presente
  public readonly image: InputSignal<string> = input<string>('');
  public readonly name: InputSignal<string> = input<string>('');
  public readonly price: InputSignal<number> = input<number>(0);
  public readonly raised: InputSignal<number> = input<number>(0);
  public readonly total: InputSignal<number> = input<number>(0);
  public readonly presentClick: OutputEmitterRef<void> = output<void>();
  public readonly ButtonVariant: typeof ButtonVariant = ButtonVariant;
  public readonly ButtonSize: typeof ButtonSize = ButtonSize;

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