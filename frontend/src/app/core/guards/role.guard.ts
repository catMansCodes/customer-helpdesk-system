import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const requiredRole: string = route.data['role'];
  const userRole = auth.getRole();

  if (userRole === requiredRole) {
    return true;
  }

  if (userRole === 'CUSTOMER') {
    return router.createUrlTree(['/customer/tickets']);
  }
  if (userRole === 'ADMIN') {
    return router.createUrlTree(['/admin/tickets']);
  }

  return router.createUrlTree(['/login']);
};
