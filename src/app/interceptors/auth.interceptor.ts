import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
//==CLAUDE==: Mudar isso para ser uma classe abstrata, para facilitar a adição de outras funcionalidades no futuro, como controle de expiração do token e refresh token, e também para seguir a convenção do Angular que é usar classes para serviços e interceptors
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
