import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketResponse, TicketService, TicketStatus } from '../../../core/services/ticket.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="fw-bold mb-0">My Tickets</h4>
      <a routerLink="/customer/tickets/new" class="btn btn-primary">
        <i class="fas fa-plus me-1"></i>New Ticket
      </a>
    </div>

    @if (loading) {
      <div class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>
    } @else if (tickets.length === 0) {
      <div class="card shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-ticket-alt fa-3x mb-3 d-block"></i>
          No tickets yet. <a routerLink="/customer/tickets/new">Open one now.</a>
        </div>
      </div>
    } @else {
      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (ticket of tickets; track ticket.id) {
                <tr>
                  <td class="text-muted">{{ ticket.id }}</td>
                  <td class="fw-medium">{{ ticket.subject }}</td>
                  <td><span [class]="badgeClass(ticket.status)">{{ labelOf(ticket.status) }}</span></td>
                  <td class="text-muted">{{ ticket.updatedAt | date:'dd MMM y, HH:mm' }}</td>
                  <td>
                    <a [routerLink]="['/customer/tickets', ticket.id]"
                       class="btn btn-sm btn-outline-primary">View</a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `
})
export class CustomerDashboardComponent implements OnInit {
  tickets: TicketResponse[] = [];
  loading = true;

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.ticketService.getMyTickets().subscribe({
      next: data => { this.tickets = data; this.loading = false; },
      error: () => { this.loading = false; }
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
}
