import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, WritableSignal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { EndpointsUrls } from '../constants/api-endpoints';
import { UserRole } from '../enums/user-role.enum';
import { ApiResponse } from '../models/api-response.model';
import { AuthLoginState } from '../models/auth-login-state.model';
import { LoginApiTokenData } from '../models/login-api-token-data.model';
import { LoginRequest } from '../models/login-request.model';
import { ApiResponseUtil } from '../utils/api-response.util';
import { HttpErrorUtil } from '../utils/http-error';
import { JwtUtil } from '../utils/jwt.util';

@Injectable({ providedIn: 'root' })
export class AuthService {
  public readonly tokenKey: string = 'auth_token';
  public readonly loginState: WritableSignal<AuthLoginState> = signal<AuthLoginState>({
    loading: false,
    error: '',
    success: false,
  });

  public constructor(public readonly http: HttpClient, public readonly router: Router, public readonly endpointsUrls: EndpointsUrls) {}

  public authenticate(credentials: LoginRequest): void {
    this.patchLoginState({ loading: true, error: '', success: false });

    this.http.post<ApiResponse<LoginApiTokenData>>(this.endpointsUrls.authLogin, credentials)
      .pipe(
        ApiResponseUtil.data<LoginApiTokenData>('E-mail ou senha invalidos.'),
        finalize((): void => this.patchLoginState({ loading: false })),
      )
      .subscribe({
        next: (response: LoginApiTokenData): void => {
          const token: string | null = this.extractToken(response);

          if (!token) {
            this.patchLoginState({ error: 'Token ausente na resposta de login.' });
            return;
          }

          localStorage.setItem(this.tokenKey, token);
          this.patchLoginState({ success: true });
        },
        error: (err: HttpErrorResponse): void => {
          this.patchLoginState({ error: HttpErrorUtil.extract(err, 'E-mail ou senha invalidos.') });
        },
      });
  }

  public resetLoginState(): void {
    this.patchLoginState({ error: '', success: false });
  }

  public logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.resetLoginState();
    this.router.navigate(['/admin/login']);
  }

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public isAuthenticated(): boolean {
    const token: string | null = this.getToken();

    if (!token)
      return false;

    return !JwtUtil.isExpired(token);
  }

  public getRoles(): string[] {
    const token: string | null = this.getToken();

    if (!token)
      return [];

    return JwtUtil.extractRoles(token);
  }

  public hasRole(role: UserRole): boolean {
    return this.getRoles().includes(role);
  }

  public extractToken(response: LoginApiTokenData): string | null {
    if (!response.accessToken.trim())
      return null;

    return response.accessToken;
  }

  public patchLoginState(partialState: Partial<AuthLoginState>): void {
    this.loginState.update((currentState: AuthLoginState): AuthLoginState => ({ ...currentState, ...partialState }));
  }
}
