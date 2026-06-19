import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { EndpointsUrls } from '../constants/api-endpoints';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  public constructor(public readonly auth: AuthService, public readonly endpointsUrls: EndpointsUrls) {}

  public intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token: string | null = this.auth.getToken();
    const isApiRequest: boolean = req.url.startsWith(this.endpointsUrls.apiUrl);

    if (!token || !isApiRequest || req.url === this.endpointsUrls.authLogin)
      return next.handle(req);

    const authReq: HttpRequest<unknown> = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

    return next.handle(authReq).pipe(catchError((err: HttpErrorResponse): Observable<never> => {
      if (err.status === 401)
        this.auth.logout();

      return throwError((): HttpErrorResponse => err);
    }));
  }
}
