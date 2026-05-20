import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
}

interface LoginApiResponse {
  access_token?: string;
  accessToken?: string;
  token?: string;
  jwt?: string;
  data?: {
    access_token?: string;
    accessToken?: string;
    token?: string;
    jwt?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginApiResponse>(`${this.base}/auth/login`, credentials).pipe(
      map(res => {
        const token = this.extractToken(res);
        if (!token) throw new Error('Token ausente na resposta de login.');
        return { access_token: token };
      }),
      tap(res => localStorage.setItem(this.TOKEN_KEY, res.access_token))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/admin/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private extractToken(response: LoginApiResponse): string | null {
    const candidates = [
      response.access_token,
      response.accessToken,
      response.token,
      response.jwt,
      response.data?.access_token,
      response.data?.accessToken,
      response.data?.token,
      response.data?.jwt
    ];

    return candidates.find(token => typeof token === 'string' && token.trim().length > 0) ?? null;
  }
}
