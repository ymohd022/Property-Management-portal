import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private tokenKey = 'auth_token';
  private userKey = 'current_user';
  
  constructor(private http: HttpClient) {}
  
  login(email: string, password: string): Observable<any> {
    // For demo purposes, we'll simulate a successful login
    // In a real app, this would make an HTTP request to your backend
    if (email === 'admin@qmaks.com' && password === 'password') {
      const mockResponse = {
        token: 'mock-jwt-token',
        user: {
          id: 1,
          name: 'Admin User',
          email: 'admin@qmaks.com',
          role: 'Admin'
        }
      };
      
      this.setSession(mockResponse);
      return of(mockResponse).pipe(delay(1000)); // Simulate network delay
    }
    
    return throwError(() => new Error('Invalid credentials'));
  }
  
  forgotPassword(email: string): Observable<any> {
    // For demo purposes, we'll simulate a successful request
    // In a real app, this would make an HTTP request to your backend
    return of({ success: true }).pipe(delay(1000)); // Simulate network delay
  }
  
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }
  
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  
  getCurrentUser(): any {
    const userJson = localStorage.getItem(this.userKey);
    return userJson ? JSON.parse(userJson) : null;
  }
  
  private setSession(authResult: any): void {
    localStorage.setItem(this.tokenKey, authResult.token);
    localStorage.setItem(this.userKey, JSON.stringify(authResult.user));
  }
}