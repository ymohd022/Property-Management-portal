import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import  { Observable } from "rxjs"
import { tap } from "rxjs/operators"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = "http://localhost:3000/api"
  private tokenKey = "auth_token"
  private userKey = "current_user"

  constructor(private http: HttpClient) {}

  // auth.service.ts
login(email: string, password: string): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password }); // Ensure "auth/login"
}

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/forgot-password`, { email })
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.userKey)
  }

  isLoggedIn(): boolean {
    return !!this.getToken()
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey)
  }

  getCurrentUser(): any {
    const userJson = localStorage.getItem(this.userKey)
    return userJson ? JSON.parse(userJson) : null
  }

  private setSession(authResult: any): void {
    localStorage.setItem(this.tokenKey, authResult.token)
    localStorage.setItem(this.userKey, JSON.stringify(authResult.user))
  }
}
