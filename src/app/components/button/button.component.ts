import { Component, InputSignal, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  public readonly variant: InputSignal<'primary' | 'secondary' | 'outline'> = input<'primary' | 'secondary' | 'outline'>('primary');
  public readonly size: InputSignal<'sm' | 'md' | 'lg'> = input<'sm' | 'md' | 'lg'>('md');
  public readonly disabled: InputSignal<boolean> = input<boolean>(false);
  public readonly type: InputSignal<'button' | 'submit' | 'reset'> = input<'button' | 'submit' | 'reset'>('button');

  public get buttonClasses(): string {
    return `${this.variant()} ${this.size()}`;
  }
}
