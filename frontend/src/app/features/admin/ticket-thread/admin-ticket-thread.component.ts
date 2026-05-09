import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  MessageResponse,
  SenderType,
  TicketResponse,
  TicketService,
  TicketStatus
} from '../../../core/services/ticket.service';

@Component({
  selector: 'app-admin-ticket-thread',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  template: `
    <div class="mb-4">
      <a routerLink="/admin/tickets" class="text-decoration-none text-muted">
        <i class="fas fa-arrow-left me-1"></i>Back to All Tickets
      </a>
    </div>

    @if (loading) {
      <div class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>
    } @else if (ticket) {
      <!-- Ticket header -->
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div>
              <h5 class="fw-bold mb-1">{{ ticket.subject }}</h5>
              <small class="text-muted">
                <i class="fas fa-user me-1"></i>{{ ticket.customerName }}
                &nbsp;&bull;&nbsp;{{ ticket.customerEmail }}
                &nbsp;&bull;&nbsp;Opened {{ ticket.createdAt | date:'dd MMM y, HH:mm' }}
              </small>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span [class]="badgeClass(ticket.status)">{{ labelOf(ticket.status) }}</span>
              @if (ticket.status !== 'CLOSED') {
                <button class="btn btn-sm btn-danger" (click)="closeTicket()" [disabled]="actioning">
                  @if (actioning) { <span class="spinner-border spinner-border-sm me-1"></span> }
                  <i class="fas fa-times-circle me-1"></i>Close
                </button>
              } @else {
                <button class="btn btn-sm btn-success" (click)="reopenTicket()" [disabled]="actioning">
                  @if (actioning) { <span class="spinner-border spinner-border-sm me-1"></span> }
                  <i class="fas fa-redo me-1"></i>Reopen
                </button>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Message thread -->
      <div class="d-flex flex-column gap-3 mb-4">
        @for (msg of messages; track msg.id) {
          <div [class]="msg.senderType === 'CUSTOMER' ? 'd-flex justify-content-start' : 'd-flex justify-content-end'">
            <div [class]="bubbleClass(msg.senderType)" style="max-width:72%;">
              <small class="fw-semibold d-block mb-1">{{ senderLabel(msg.senderType) }}</small>
              <p class="mb-1" style="white-space:pre-wrap;">{{ msg.content }}</p>
              <small class="opacity-75">{{ msg.createdAt | date:'dd MMM y, HH:mm' }}</small>
            </div>
          </div>
        }
      </div>

      <!-- Reply box -->
      @if (ticket.status !== 'CLOSED') {
        <div class="card shadow-sm">
          <div class="card-body">
            <form [formGroup]="replyForm" (ngSubmit)="sendReply()">
              <div class="mb-3">
                <label class="form-label fw-medium">Reply as Support Agent</label>
                <textarea class="form-control"
                          [class.is-invalid]="replySub && replyForm.controls['content'].errors"
                          formControlName="content"
                          rows="3"
                          placeholder="Type your response..."></textarea>
                <div class="invalid-feedback">Message cannot be empty.</div>
              </div>
              <button type="submit" class="btn btn-primary" [disabled]="sending">
                @if (sending) { <span class="spinner-border spinner-border-sm me-2"></span> }
                <i class="fas fa-paper-plane me-1"></i>Send Reply
              </button>
            </form>
          </div>
        </div>
      } @else {
        <div class="alert alert-secondary text-center">
          This ticket is closed. Reopen it to send a reply.
        </div>
      }
    }
  `
})
export class AdminTicketThreadComponent implements OnInit {
  ticket: TicketResponse | null = null;
  messages: MessageResponse[] = [];
  loading = true;
  actioning = false;
  sending = false;
  replySub = false;
  replyForm!: FormGroup;

  private ticketId!: number;

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.ticketId = Number(this.route.snapshot.paramMap.get('id'));
    this.replyForm = this.fb.group({ content: ['', Validators.required] });
    this.loadAll();
  }

  private loadAll(): void {
    this.loading = true;
    this.ticketService.getTicket(this.ticketId).subscribe({
      next: t => {
        this.ticket = t;
        this.ticketService.getMessages(this.ticketId).subscribe({
          next: m => { this.messages = m; this.loading = false; },
          error: () => { this.loading = false; }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  closeTicket(): void {
    this.actioning = true;
    this.ticketService.closeTicket(this.ticketId).subscribe({
      next: t => { this.ticket = t; this.actioning = false; },
      error: () => { this.actioning = false; }
    });
  }

  reopenTicket(): void {
    this.actioning = true;
    this.ticketService.reopenTicket(this.ticketId).subscribe({
      next: t => { this.ticket = t; this.actioning = false; },
      error: () => { this.actioning = false; }
    });
  }

  sendReply(): void {
    this.replySub = true;
    if (this.replyForm.invalid) return;

    this.sending = true;
    this.ticketService.sendMessage(this.ticketId, this.replyForm.value).subscribe({
      next: msg => {
        this.messages = [...this.messages, msg];
        this.replyForm.reset();
        this.replySub = false;
        this.sending = false;
        // refresh ticket to pick up status change (→ HUMAN_RESPONDED)
        this.ticketService.getTicket(this.ticketId).subscribe(t => this.ticket = t);
      },
      error: () => { this.sending = false; }
    });
  }

  badgeClass(status: TicketStatus): string {
    const map: Record<TicketStatus, string> = {
      OPEN: 'badge bg-secondary',
      AI_RESPONDED: 'badge bg-info text-dark',
      ESCALATED: 'badge bg-warning text-dark',
      HUMAN_RESPONDED: 'badge bg-success',
      CLOSED: 'badge bg-dark'
    };
    return map[status] ?? 'badge bg-secondary';
  }

  labelOf(status: TicketStatus): string {
    const map: Record<TicketStatus, string> = {
      OPEN: 'Open',
      AI_RESPONDED: 'AI Responded',
      ESCALATED: 'Escalated',
      HUMAN_RESPONDED: 'Human Responded',
      CLOSED: 'Closed'
    };
    return map[status] ?? status;
  }

  bubbleClass(sender: SenderType): string {
    if (sender === 'CUSTOMER') return 'card p-3 border-start border-4 border-primary bg-white';
    if (sender === 'AI') return 'card p-3 border-start border-4 border-info bg-white';
    return 'card p-3 bg-primary text-white';
  }

  senderLabel(sender: SenderType): string {
    if (sender === 'AI') return '🤖 AI Assistant';
    if (sender === 'ADMIN') return '🛠 You (Support Agent)';
    return '👤 Customer';
  }
}
