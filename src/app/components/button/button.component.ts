import { Component, InputSignal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonVariant } from '../../enums/button-variant.enum';
import { ButtonSize } from '../../enums/button-size.enum';
import { ButtonType } from '../../enums/button-type.enum';

@Component({
  standalone: true,
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  imports: [CommonModule]
})
export class ButtonComponent {
  public readonly variant: InputSignal<ButtonVariant> = input<ButtonVariant>(ButtonVariant.Primary);
  public readonly size: InputSignal<ButtonSize> = input<ButtonSize>(ButtonSize.Md);
  public readonly disabled: InputSignal<boolean> = input<boolean>(false);
  public readonly type: InputSignal<ButtonType> = input<ButtonType>(ButtonType.Button);

  public get buttonClasses(): string {
    return `${this.variant()} ${this.size()}`;
  }
}
