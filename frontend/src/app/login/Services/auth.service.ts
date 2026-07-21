import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

export interface LoginResponse {
  token: string;
  codiceRuolo: string;
  admin: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'https://hotel-4n9x.onrender.com/auth/login';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, {
      email: email,
      password: password
    }).pipe(timeout(15000));
  }

  salvaSessione(response: LoginResponse): void {
    sessionStorage.setItem('token', response.token);
    sessionStorage.setItem('admin', String(response.admin));
    sessionStorage.setItem('mail', response.codiceRuolo);
  }

  getMail(): string {
    return sessionStorage.getItem('mail') ?? '';
  }

  isAdmin(): boolean {
    return sessionStorage.getItem('admin') === 'true';
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('token');
  }

  logout(): void {
    sessionStorage.clear();
  }
}