import { Component, OnInit } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { UserProfile, UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [DatePipe, TitleCasePipe],
  template: `
    <h4 class="fw-bold mb-4">My Profile</h4>

    @if (loading) {
      <div class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>
    } @else if (profile) {
      <div class="card shadow-sm" style="max-width:480px;">
        <div class="card-body p-4">
          <div class="d-flex align-items-center gap-3 mb-4">
            <div class="rounded-circle bg-primary text-white d-flex align-items-center
                        justify-content-center fw-bold fs-4"
                 style="width:56px;height:56px;">
              {{ initial }}
            </div>
            <div>
              <h5 class="mb-0 fw-bold">{{ profile.name }}</h5>
              <small class="text-muted">{{ profile.role | titlecase }}</small>
            </div>
          </div>

          <ul class="list-group list-group-flush">
            <li class="list-group-item px-0 d-flex justify-content-between">
              <span class="text-muted"><i class="fas fa-envelope me-2"></i>Email</span>
              <span class="fw-medium">{{ profile.email }}</span>
            </li>
            <li class="list-group-item px-0 d-flex justify-content-between">
              <span class="text-muted"><i class="fas fa-shield-alt me-2"></i>Role</span>
              <span class="fw-medium">{{ profile.role | titlecase }}</span>
            </li>
            <li class="list-group-item px-0 d-flex justify-content-between">
              <span class="text-muted"><i class="fas fa-calendar-alt me-2"></i>Member since</span>
              <span class="fw-medium">{{ profile.createdAt | date:'dd MMM y' }}</span>
            </li>
          </ul>
        </div>
      </div>
    }
  `
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  loading = true;
  initial = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: p => {
        this.profile = p;
        this.initial = p.name.charAt(0).toUpperCase();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
