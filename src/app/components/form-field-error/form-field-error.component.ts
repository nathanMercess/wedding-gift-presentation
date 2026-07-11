import { Component, InputSignal, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-form-field-error',
    templateUrl: './form-field-error.component.html',
    styleUrl: './form-field-error.component.scss',
    imports: [CommonModule]
})
export class FormFieldErrorComponent {
  public readonly message: InputSignal<string> = input.required<string>();
  public readonly visible: InputSignal<boolean> = input<boolean>(false);
}
