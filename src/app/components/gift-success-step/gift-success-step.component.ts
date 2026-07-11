import { Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { ButtonVariant } from '../../enums/button-variant.enum';
import { ButtonType } from '../../enums/button-type.enum';

@Component({
    selector: 'app-gift-success-step',
    templateUrl: './gift-success-step.component.html',
    styleUrl: './gift-success-step.component.scss',
    imports: [CommonModule, ButtonComponent]
})
export class GiftSuccessStepComponent {
  public readonly giftName: InputSignal<string> = input.required<string>();
  public readonly amount: InputSignal<number> = input.required<number>();
  public readonly coupleName: InputSignal<string> = input.required<string>();

  public readonly close: OutputEmitterRef<void> = output<void>();

  public readonly ButtonVariant: typeof ButtonVariant = ButtonVariant;
  public readonly ButtonType: typeof ButtonType = ButtonType;
}
