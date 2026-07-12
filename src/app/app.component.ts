import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  standalone: true,
  selector: 'app-root',
  template: `
    <a class="skip-link" href="#main-content">Ir para o conteúdo</a>
    <app-toast />
    <router-outlet />
  `,
  imports: [RouterOutlet, ToastComponent],
})
export class AppComponent {}
