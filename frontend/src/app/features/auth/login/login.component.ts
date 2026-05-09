import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="d-flex vh-100 align-items-center justify-content-center bg-light">
      <div class="card shadow-sm" style="width:400px;">
        <div class="card-body p-4">
          <h4 class="card-title text-center mb-1 fw-bold">
            <i class="fas fa-headset text-primary me-2"></i>Helpdesk
          </h4>
          <p class="text-center text-muted mb-4">Sign in to your account</p>

          @if (errorMsg) {
            <div class="alert alert-danger py-2">{{ errorMsg }}</div>
          }

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control"
                     [class.is-invalid]="submitted && f['email'].errors"
                     formControlName="email" placeholder="you@example.com">
              <div class="invalid-feedback">Enter a valid email address.</div>
            </div>

            <div class="mb-4">
              <label class="form-label">Password</label>
              <input type="password" class="form-control"
                     [class.is-invalid]="submitted && f['password'].errors"
                     formControlName="password" placeholder="••••••••">
              <div class="invalid-feedback">Password is required.</div>
            </div>

            <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
              @if (loading) {
                <span class="spinner-border spinner-border-sm me-2"></span>
              }
              Sign In
            </button>
          </form>

          <hr class="my-3">
          <p class="text-center text-muted mb-0" style="font-size:.9rem;">
            No account? <a routerLink="/register">Register here</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  loading = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.redirectByRole();
      return;
    }
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get f() { return this.form.controls; }

  submit(): void {
    this.submitted = true;
    this.errorMsg = '';
    if (this.form.invalid) return;

    this.loading = true;
    this.auth.login(this.form.value).subscribe({
      next: () => this.redirectByRole(),
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.message ?? 'Invalid email or password.';
      }
    });
  }

  private redirectByRole(): void {
    const role = this.auth.getRole();
    this.router.navigate([role === 'ADMIN' ? '/admin/tickets' : '/customer/tickets']);
  }
}
