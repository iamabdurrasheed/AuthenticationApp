import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>🏠 Dashboard</h1>
        <button class="btn-logout" (click)="logout()">Logout</button>
      </div>

      <div class="dashboard-card">
        <div *ngIf="loading">Loading...</div>
        <div *ngIf="!loading && dashboardData">
          <p><strong>{{ dashboardData.message }}</strong></p>
          <br>
          <p>👤 Logged in as: <strong>{{ dashboardData.username }}</strong></p>
          <p>📧 Email: <strong>{{ user?.email }}</strong></p>
        </div>
        <div *ngIf="error" class="alert alert-error">{{ error }}</div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  dashboardData: { message: string; username: string } | null = null;
  user = this.auth.getUser();
  loading = true;
  error = '';

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit(): void {
    this.http.get<{ message: string; username: string }>('http://localhost:8080/api/dashboard').subscribe({
      next: data => { this.dashboardData = data; this.loading = false; },
      error: () => { this.error = 'Failed to load dashboard data.'; this.loading = false; }
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
