import { Injectable, WritableSignal, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { EndpointsUrls } from '../constants/api-endpoints';
import { AuthLoginState } from '../models/auth-login-state.model';
import { LoginApiResponse } from '../models/login-api-response.model';
import { LoginRequest } from '../models/login-request.model';

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

    this.http.post<LoginApiResponse>(this.endpointsUrls.authLogin, credentials).pipe(finalize((): void => this.patchLoginState({ loading: false }))).subscribe({
      next: (response: LoginApiResponse): void => {
        const token: string | null = this.extractToken(response);
        if (!token) {
          this.patchLoginState({ error: 'Token ausente na resposta de login.' });
          return;
        }

        localStorage.setItem(this.tokenKey, token);
        this.patchLoginState({ success: true });
      },
      error: (): void => {
        this.patchLoginState({ error: 'E-mail ou senha inválidos.' });
      }
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
    return !!this.getToken();
  }

  public extractToken(response: LoginApiResponse): string | null {
    const candidates: Array<string | undefined> = [
      response.access_token,
      response.accessToken,
      response.token,
      response.jwt,
      response.data?.access_token,
      response.data?.accessToken,
      response.data?.token,
      response.data?.jwt
    ];

    return candidates.find((token: string | undefined): boolean => typeof token === 'string' && token.trim().length > 0) ?? null;
  }

  public patchLoginState(partialState: Partial<AuthLoginState>): void {
    this.loginState.update((currentState: AuthLoginState): AuthLoginState => ({ ...currentState, ...partialState }));
  }
}
