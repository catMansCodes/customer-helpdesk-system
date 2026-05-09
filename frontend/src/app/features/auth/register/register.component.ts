import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="d-flex vh-100 align-items-center justify-content-center bg-light">
      <div class="card shadow-sm" style="width:420px;">
        <div class="card-body p-4">
          <h4 class="card-title text-center mb-1 fw-bold">
            <i class="fas fa-headset text-primary me-2"></i>Helpdesk
          </h4>
          <p class="text-center text-muted mb-4">Create a customer account</p>

          @if (errorMsg) {
            <div class="alert alert-danger py-2">{{ errorMsg }}</div>
          }

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="mb-3">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-control"
                     [class.is-invalid]="submitted && f['name'].errors"
                     formControlName="name" placeholder="Jane Doe">
              <div class="invalid-feedback">Name is required.</div>
            </div>

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
                     formControlName="password" placeholder="Min. 6 characters">
              <div class="invalid-feedback">Password must be at least 6 characters.</div>
            </div>

            <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
              @if (loading) {
                <span class="spinner-border spinner-border-sm me-2"></span>
              }
              Create Account
            </button>
          </form>

          <hr class="my-3">
          <p class="text-center text-muted mb-0" style="font-size:.9rem;">
            Already have an account? <a routerLink="/login">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent implements OnInit {
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
      this.router.navigate(['/customer/tickets']);
      return;
    }
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() { return this.form.controls; }

  submit(): void {
    this.submitted = true;
    this.errorMsg = '';
    if (this.form.invalid) return;

    this.loading = true;
    this.auth.register(this.form.value).subscribe({
      next: () => this.router.navigate(['/customer/tickets']),
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.message ?? 'Registration failed. Please try again.';
      }
    });
  }
}
