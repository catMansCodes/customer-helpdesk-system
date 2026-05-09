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
  selector: 'app-customer-ticket-thread',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  template: `
    <div class="mb-4">
      <a routerLink="/customer/tickets" class="text-decoration-none text-muted">
        <i class="fas fa-arrow-left me-1"></i>Back to My Tickets
      </a>
    </div>

    @if (loading) {
      <div class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>
    } @else if (ticket) {
      <!-- Ticket header -->
      <div class="card shadow-sm mb-4">
        <div class="card-body d-flex justify-content-between align-items-start">
          <div>
            <h5 class="fw-bold mb-1">{{ ticket.subject }}</h5>
            <small class="text-muted">Opened {{ ticket.createdAt | date:'dd MMM y, HH:mm' }}</small>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span [class]="badgeClass(ticket.status)">{{ labelOf(ticket.status) }}</span>
            @if (ticket.status === 'AI_RESPONDED') {
              <button class="btn btn-warning btn-sm" (click)="escalate()" [disabled]="escalating">
                @if (escalating) {
                  <span class="spinner-border spinner-border-sm me-1"></span>
                }
                Mark Unresolved
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Message thread -->
      <div class="d-flex flex-column gap-3 mb-4">
        @for (msg of messages; track msg.id) {
          <div [class]="msg.senderType === 'CUSTOMER' ? 'd-flex justify-content-end' : 'd-flex justify-content-start'">
            <div [class]="bubbleClass(msg.senderType)" style="max-width:72%;">
              <small class="fw-semibold d-block mb-1">{{ senderLabel(msg.senderType) }}</small>
              <p class="mb-1" style="white-space:pre-wrap;">{{ msg.content }}</p>
              <small class="opacity-75">{{ msg.createdAt | date:'dd MMM y, HH:mm' }}</small>
            </div>
          </div>
        }
      </div>

      <!-- Reply box — hidden when closed -->
      @if (ticket.status !== 'CLOSED') {
        <div class="card shadow-sm">
          <div class="card-body">
            <form [formGroup]="replyForm" (ngSubmit)="sendReply()">
              <div class="mb-3">
                <label class="form-label fw-medium">Reply</label>
                <textarea class="form-control"
                          [class.is-invalid]="replySub && replyForm.controls['content'].errors"
                          formControlName="content"
                          rows="3"
                          placeholder="Type your message..."></textarea>
                <div class="invalid-feedback">Message cannot be empty.</div>
              </div>
              <button type="submit" class="btn btn-primary" [disabled]="sending">
                @if (sending) {
                  <span class="spinner-border spinner-border-sm me-2"></span>
                }
                <i class="fas fa-paper-plane me-1"></i>Send
              </button>
            </form>
          </div>
        </div>
      } @else {
        <div class="alert alert-secondary text-center">This ticket is closed.</div>
      }
    }
  `
})
export class CustomerTicketThreadComponent implements OnInit {
  ticket: TicketResponse | null = null;
  messages: MessageResponse[] = [];
  loading = true;
  escalating = false;
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

  escalate(): void {
    this.escalating = true;
    this.ticketService.escalateTicket(this.ticketId).subscribe({
      next: t => { this.ticket = t; this.escalating = false; },
      error: () => { this.escalating = false; }
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
    if (sender === 'CUSTOMER') return 'card p-3 bg-primary text-white';
    if (sender === 'AI') return 'card p-3 border-start border-4 border-info bg-white';
    return 'card p-3 border-start border-4 border-success bg-white';
  }

  senderLabel(sender: SenderType): string {
    if (sender === 'AI') return '🤖 AI Assistant';
    if (sender === 'ADMIN') return '🛠 Support Agent';
    return '👤 You';
  }
}
