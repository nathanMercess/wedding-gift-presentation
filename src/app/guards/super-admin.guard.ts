import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../enums/user-role.enum';

export const superAdminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated())
    return router.createUrlTree(['/admin/login']);

  if (!auth.hasRole(UserRole.SuperAdmin))
    return router.createUrlTree(['/admin/access-denied']);

  return true;
};
