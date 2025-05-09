import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup
  isLoading = false
  hidePassword = true

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    })
  }

  ngOnInit() {
    // Check if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(["/dashboard"])
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true
      const { email, password } = this.loginForm.value

      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.isLoading = false
          // Check user role and navigate accordingly
          const user = response.user
          if (user.role === "admin") {
            this.router.navigate(["/dashboard"])
          } else if (user.role === "agent") {
            this.router.navigate(["/agent/dashboard"])
          } else {
            this.router.navigate(["/dashboard"])
          }
        },
        error: (error) => {
          this.isLoading = false
          console.error("Login error:", error)
          let errorMessage = "Invalid credentials"

          if (error.status === 401) {
            errorMessage = "Invalid email or password"
          } else if (error.status === 403) {
            errorMessage = "Your account is inactive. Please contact the administrator."
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message
          }

          this.snackBar.open("Login failed: " + errorMessage, "Close", {
            duration: 5000,
            panelClass: ["error-snackbar"],
          })
        },
      })
    } else {
      this.loginForm.markAllAsTouched()
    }
  }

  navigateToForgotPassword() {
    this.router.navigate(["/forgot-password"])
  }
}
