import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastItem } from '../../services/toast.service';

@Component({
    selector: 'app-toast',
    templateUrl: './toast.component.html',
    styleUrl: './toast.component.scss',
    imports: [CommonModule]
})
export class ToastComponent {
  public constructor(public readonly toastService: ToastService) {}

  public trackById(_: number, t: ToastItem): number {
    return t.id;
  }
}
