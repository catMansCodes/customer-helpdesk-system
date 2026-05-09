import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketResponse, TicketService, TicketStatus } from '../../../core/services/ticket.service';

type FilterTab = 'ALL' | TicketStatus;

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="fw-bold mb-0">All Tickets</h4>
      <small class="text-muted">{{ filtered.length }} ticket{{ filtered.length !== 1 ? 's' : '' }}</small>
    </div>

    <!-- Filter tabs -->
    <ul class="nav nav-pills mb-3 flex-wrap gap-1">
      @for (tab of tabs; track tab.value) {
        <li class="nav-item">
          <button class="nav-link"
                  [class.active]="activeTab === tab.value"
                  (click)="setTab(tab.value)">
            {{ tab.label }}
            <span class="badge ms-1"
                  [class]="activeTab === tab.value ? 'bg-white text-primary' : 'bg-secondary'">
              {{ countOf(tab.value) }}
            </span>
          </button>
        </li>
      }
    </ul>

    @if (loading) {
      <div class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>
    } @else if (filtered.length === 0) {
      <div class="card shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-inbox fa-3x mb-3 d-block"></i>
          No tickets match this filter.
        </div>
      </div>
    } @else {
      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (ticket of filtered; track ticket.id) {
                <tr>
                  <td class="text-muted">{{ ticket.id }}</td>
                  <td>
                    <div class="fw-medium">{{ ticket.customerName }}</div>
                    <small class="text-muted">{{ ticket.customerEmail }}</small>
                  </td>
                  <td>{{ ticket.subject }}</td>
                  <td><span [class]="badgeClass(ticket.status)">{{ labelOf(ticket.status) }}</span></td>
                  <td class="text-muted">{{ ticket.updatedAt | date:'dd MMM y, HH:mm' }}</td>
                  <td>
                    <a [routerLink]="['/admin/tickets', ticket.id]"
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
export class AdminDashboardComponent implements OnInit {
  tickets: TicketResponse[] = [];
  filtered: TicketResponse[] = [];
  loading = true;
  activeTab: FilterTab = 'ALL';

  tabs: { label: string; value: FilterTab }[] = [
    { label: 'All',            value: 'ALL' },
    { label: 'Open',           value: 'OPEN' },
    { label: 'AI Responded',   value: 'AI_RESPONDED' },
    { label: 'Escalated',      value: 'ESCALATED' },
    { label: 'Human Responded',value: 'HUMAN_RESPONDED' },
    { label: 'Closed',         value: 'CLOSED' }
  ];

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.ticketService.getAllTickets().subscribe({
      next: data => {
        this.tickets = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  setTab(tab: FilterTab): void {
    this.activeTab = tab;
    this.applyFilter();
  }

  private applyFilter(): void {
    this.filtered = this.activeTab === 'ALL'
      ? this.tickets
      : this.tickets.filter(t => t.status === this.activeTab);
  }

  countOf(tab: FilterTab): number {
    return tab === 'ALL'
      ? this.tickets.length
      : this.tickets.filter(t => t.status === tab).length;
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
