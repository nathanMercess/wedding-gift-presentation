import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { authGuard } from './guards/auth.guard';

registerLocaleData(localePt, 'pt-BR');

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    provideRouter([
      { path: '', redirectTo: 'gifts', pathMatch: 'full' },
      {
        path: 'gifts',
        loadComponent: () =>
          import('./components/guest-view/guest-view.component').then(m => m.GuestViewComponent),
      },
      {
        path: 'admin/login',
        loadComponent: () =>
          import('./components/admin/admin-login/admin-login.component').then(m => m.AdminLoginComponent),
      },
      {
        path: 'admin',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./components/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
      },
      {
        path: 'checkout',
        loadChildren: () =>
          import('./checkout/checkout.routes').then(m => m.CHECKOUT_ROUTES),
      },
      { path: '**', redirectTo: 'gifts' },
    ]),
  ],
};
