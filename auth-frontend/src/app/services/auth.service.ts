import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:8080/api/auth';

  // In-memory storage — not accessible to injected scripts (safer than localStorage)
  private session: AuthResponse | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  register(data: { username: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, data).pipe(
      tap(res => this.session = res)
    );
  }

  login(data: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, data).pipe(
      tap(res => this.session = res)
    );
  }

  logout(): void {
    this.session = null;
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.session?.token ?? null;
  }

  getUser(): AuthResponse | null {
    return this.session;
  }

  isLoggedIn(): boolean {
    return !!this.session?.token;
  }
}
