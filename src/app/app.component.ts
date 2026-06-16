import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-root',
  template: `
    <p-toast position="top-right" />
    <router-outlet />
  `,
  imports: [RouterOutlet, Toast],
  providers: [MessageService],
})
export class AppComponent {}
