import { Injectable } from "@angular/core"
import  { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from "@angular/common/http"
import {  Observable, throwError } from "rxjs"
import { catchError } from "rxjs/operators"
import  { Router } from "@angular/router"
import  { AuthService } from "../services/auth.service"

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get the auth token from the service
    const token = this.authService.getToken()

    // Clone the request and add the authorization header if token exists
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    }

    // Handle the request and catch any errors
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // If we get a 401 Unauthorized response, log the user out
        if (error.status === 401) {
          this.authService.logout()
          this.router.navigate(["/login"])
        }
        return throwError(() => error)
      }),
    )
  }
}
