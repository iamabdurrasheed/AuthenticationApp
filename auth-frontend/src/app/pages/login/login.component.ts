import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Sign In</h2>

        <div *ngIf="errorMsg" class="alert alert-error">{{ errorMsg }}</div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Username</label>
            <input formControlName="username" type="text" placeholder="Enter username"
              [class.invalid]="isInvalid('username')">
            <div *ngIf="isInvalid('username')" class="error-msg">Username is required</div>
          </div>

          <div class="form-group">
            <label>Password</label>
            <input formControlName="password" type="password" placeholder="Enter password"
              [class.invalid]="isInvalid('password')">
            <div *ngIf="isInvalid('password')" class="error-msg">Password is required</div>
          </div>

          <button class="btn" type="submit" [disabled]="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="link-row">
          Don't have an account? <a routerLink="/register">Register</a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  form: FormGroup;
  errorMsg = '';
  loading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
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
    this.auth.login(this.form.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        this.errorMsg = err.error?.message || 'Login failed. Please check your credentials.';
        this.loading = false;
      }
    });
  }
}
