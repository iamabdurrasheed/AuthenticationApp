import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Create Account</h2>

        <div *ngIf="errorMsg" class="alert alert-error">{{ errorMsg }}</div>
        <div *ngIf="successMsg" class="alert alert-success">{{ successMsg }}</div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Username</label>
            <input formControlName="username" type="text" placeholder="Choose a username"
              [class.invalid]="isInvalid('username')">
            <div *ngIf="isInvalid('username')" class="error-msg">
              {{ form.get('username')?.hasError('required') ? 'Username is required' : 'Min 3 characters' }}
            </div>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input formControlName="email" type="email" placeholder="Enter your email"
              [class.invalid]="isInvalid('email')">
            <div *ngIf="isInvalid('email')" class="error-msg">Valid email is required</div>
          </div>

          <div class="form-group">
            <label>Password</label>
            <input formControlName="password" type="password" placeholder="Min 6 characters"
              [class.invalid]="isInvalid('password')">
            <div *ngIf="isInvalid('password')" class="error-msg">
              {{ form.get('password')?.hasError('required') ? 'Password is required' : 'Min 6 characters' }}
            </div>
          </div>

          <button class="btn" type="submit" [disabled]="loading">
            {{ loading ? 'Creating account...' : 'Register' }}
          </button>
        </form>

        <div class="link-row">
          Already have an account? <a routerLink="/login">Sign In</a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  form: FormGroup;
  errorMsg = '';
  successMsg = '';
  loading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field)!;
    return ctrl.invalid && ctrl.touched;
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMsg = '';
    this.auth.register(this.form.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        this.errorMsg = err.error?.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
