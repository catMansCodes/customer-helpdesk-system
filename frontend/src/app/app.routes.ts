import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { ShellComponent } from './shared/layout/shell.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'customer',
    component: ShellComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'CUSTOMER' },
    children: [
      { path: '', redirectTo: 'tickets', pathMatch: 'full' },
      {
        path: 'tickets',
        loadComponent: () =>
          import('./features/customer/dashboard/customer-dashboard.component')
            .then(m => m.CustomerDashboardComponent)
      },
      {
        path: 'tickets/new',
        loadComponent: () =>
          import('./features/customer/new-ticket/new-ticket.component')
            .then(m => m.NewTicketComponent)
      },
      {
        path: 'tickets/:id',
        loadComponent: () =>
          import('./features/customer/ticket-thread/customer-ticket-thread.component')
            .then(m => m.CustomerTicketThreadComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/shared/profile/profile.component')
            .then(m => m.ProfileComponent)
      }
    ]
  },
  {
    path: 'admin',
    component: ShellComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: '', redirectTo: 'tickets', pathMatch: 'full' },
      {
        path: 'tickets',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component')
            .then(m => m.AdminDashboardComponent)
      },
      {
        path: 'tickets/:id',
        loadComponent: () =>
          import('./features/admin/ticket-thread/admin-ticket-thread.component')
            .then(m => m.AdminTicketThreadComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/shared/profile/profile.component')
            .then(m => m.ProfileComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
