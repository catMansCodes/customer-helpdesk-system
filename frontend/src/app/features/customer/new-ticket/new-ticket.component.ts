import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';

@Component({
  selector: 'app-new-ticket',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="mb-4">
      <a routerLink="/customer/tickets" class="text-decoration-none text-muted">
        <i class="fas fa-arrow-left me-1"></i>Back to My Tickets
      </a>
    </div>

    <div class="card shadow-sm" style="max-width:680px;">
      <div class="card-body p-4">
        <h5 class="fw-bold mb-4">Open a New Ticket</h5>

        @if (errorMsg) {
          <div class="alert alert-danger py-2">{{ errorMsg }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="mb-3">
            <label class="form-label fw-medium">Subject</label>
            <input type="text" class="form-control"
                   [class.is-invalid]="submitted && f['subject'].errors"
                   formControlName="subject"
                   placeholder="Brief summary of your issue">
            <div class="invalid-feedback">Subject is required.</div>
          </div>

          <div class="mb-4">
            <label class="form-label fw-medium">Description</label>
            <textarea class="form-control"
                      [class.is-invalid]="submitted && f['description'].errors"
                      formControlName="description"
                      rows="5"
                      placeholder="Describe your issue in detail..."></textarea>
            <div class="invalid-feedback">Description is required.</div>
          </div>

          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary" [disabled]="loading">
              @if (loading) {
                <span class="spinner-border spinner-border-sm me-2"></span>
              }
              Submit Ticket
            </button>
            <a routerLink="/customer/tickets" class="btn btn-outline-secondary">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class NewTicketComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  loading = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      subject: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  get f() { return this.form.controls; }

  submit(): void {
    this.submitted = true;
    this.errorMsg = '';
    if (this.form.invalid) return;

    this.loading = true;
    this.ticketService.createTicket(this.form.value).subscribe({
      next: ticket => this.router.navigate(['/customer/tickets', ticket.id]),
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.message ?? 'Could not create ticket. Please try again.';
      }
    });
  }
}
