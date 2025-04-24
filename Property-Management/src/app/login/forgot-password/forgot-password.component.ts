import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      const email = this.forgotPasswordForm.value.email;
      
      this.authService.forgotPassword(email).subscribe({
        next: () => {
          this.isLoading = false;
          this.emailSent = true;
          this.snackBar.open('Password reset instructions sent to your email', 'Close', {
            duration: 5000
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open('Failed to send reset email: ' + (error.message || 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
