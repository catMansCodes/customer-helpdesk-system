import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="d-flex vh-100">
      <!-- Sidebar -->
      <nav class="d-flex flex-column p-3 text-white flex-shrink-0" style="width:220px;background:#1a1a2e;">
        <div class="mb-4 pt-1">
          <h5 class="fw-bold mb-0">
            <i class="fas fa-headset me-2"></i>Helpdesk
          </h5>
        </div>

        <ul class="nav flex-column flex-grow-1">
          @if (isCustomer) {
            <li class="nav-item">
              <a class="nav-link text-white rounded"
                 routerLink="/customer/tickets"
                 [routerLinkActiveOptions]="{exact:true}"
                 routerLinkActive="active-link">
                <i class="fas fa-ticket-alt me-2"></i>My Tickets
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-white rounded"
                 routerLink="/customer/tickets/new"
                 routerLinkActive="active-link">
                <i class="fas fa-plus-circle me-2"></i>New Ticket
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-white rounded"
                 routerLink="/customer/profile"
                 routerLinkActive="active-link">
                <i class="fas fa-user me-2"></i>Profile
              </a>
            </li>
          }
          @if (isAdmin) {
            <li class="nav-item">
              <a class="nav-link text-white rounded"
                 routerLink="/admin/tickets"
                 routerLinkActive="active-link">
                <i class="fas fa-list-ul me-2"></i>All Tickets
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-white rounded"
                 routerLink="/admin/profile"
                 routerLinkActive="active-link">
                <i class="fas fa-user me-2"></i>Profile
              </a>
            </li>
          }
        </ul>

        <div class="mt-auto border-top border-secondary pt-3">
          <small class="text-secondary d-block mb-2 text-truncate">{{ name }}</small>
          <button class="btn btn-outline-light btn-sm w-100" (click)="logout()">
            <i class="fas fa-sign-out-alt me-1"></i>Logout
          </button>
        </div>
      </nav>

      <!-- Main content -->
      <main class="flex-grow-1 overflow-auto p-4 bg-light">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .active-link {
      background-color: rgba(255,255,255,0.15);
    }
    .nav-link:hover {
      background-color: rgba(255,255,255,0.08);
    }
  `]
})
export class ShellComponent implements OnInit {
  isCustomer = false;
  isAdmin = false;
  name = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    const role = this.auth.getRole();
    this.isCustomer = role === 'CUSTOMER';
    this.isAdmin = role === 'ADMIN';
    this.name = this.auth.getName() ?? '';
  }

  logout(): void {
    this.auth.logout().subscribe({
      complete: () => this.router.navigate(['/login'])
    });
  }
}
