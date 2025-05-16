import { Injectable } from "@angular/core"
import  { HttpClient, HttpErrorResponse } from "@angular/common/http"
import {  Observable, throwError } from "rxjs"
import { tap, catchError } from "rxjs/operators"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = "http://localhost:3000/api"
  private tokenKey = "auth_token"
  private userKey = "current_user"

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    console.log(`Attempting login with email: ${email}`)
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((response) => {
        console.log("Login successful:", response)
        this.setSession(response)
      }),
      catchError(this.handleError),
    )
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/forgot-password`, { email }).pipe(catchError(this.handleError))
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

  private handleError(error: HttpErrorResponse) {
    console.error("API Error:", error)

    let errorMessage = "An unknown error occurred"
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}, Message: ${error.message}`
    }

    return throwError(() => error)
  }

  // Test method to check API connectivity
  testConnection(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/test`).pipe(catchError(this.handleError))
  }
}
