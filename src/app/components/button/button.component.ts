import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'outline' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  get buttonClasses(): string {
    return `${this.variant} ${this.size}`;
  }
}
