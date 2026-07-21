import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginResponse {
  token: string;
  codiceRuolo: string;
  admin: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:8080/auth/login';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, {
      codice: email,
      password: password
    });
  }

  salvaSessione(response: LoginResponse): void {
    sessionStorage.setItem('token', response.token);
    sessionStorage.setItem('admin', String(response.admin));
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