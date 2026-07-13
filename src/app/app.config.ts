import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { adminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';
import { superAdminGuard } from './guards/super-admin.guard';

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
        path: 'admin/forgot-password',
        loadComponent: () =>
          import('./components/admin/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./components/admin/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
      },
      {
        path: 'admin/access-denied',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./components/admin/access-denied/access-denied.component').then(m => m.AccessDeniedComponent),
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./components/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
      },
      {
        path: 'super-admin/dashboard',
        canActivate: [superAdminGuard],
        loadComponent: () =>
          import('./components/admin/super-admin-dashboard/super-admin-dashboard.component').then(m => m.SuperAdminDashboardComponent),
      },
      {
        path: 'checkout',
        loadChildren: () =>
          import('./checkout/checkout.routes').then(m => m.CHECKOUT_ROUTES),
      },
      {
        path: 'pedido/:token',
        loadComponent: () =>
          import('./components/order-lookup/order-lookup.component').then(m => m.OrderLookupComponent),
      },
      {
        path: 'pedido',
        loadComponent: () =>
          import('./components/order-lookup/order-lookup.component').then(m => m.OrderLookupComponent),
      },
      { path: '**', redirectTo: 'gifts' },
    ]),
  ],
};
