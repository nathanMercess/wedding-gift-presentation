import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-root',
  template: `
    <p-toast position="top-right" />
    <router-outlet />
  `,
  imports: [RouterOutlet, ToastModule],
  providers: [MessageService],
})
export class AppComponent {}
