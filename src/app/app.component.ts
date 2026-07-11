import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './components/toast/toast.component';

@Component({
    selector: 'app-root',
    template: `
    <app-toast />
    <router-outlet />
  `,
    imports: [RouterOutlet, ToastComponent]
})
export class AppComponent {}
