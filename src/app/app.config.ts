import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { authGuard } from './guards/auth.guard';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideHttpClient(withInterceptorsFromDi()),
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
