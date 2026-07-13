import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminTab } from '../enums/admin-tab.enum';
import { AuthService } from '../services/auth.service';
import { AdminTabAccessUtil } from '../utils/admin-tab-access.util';

export const adminGuard: CanActivateFn = () => {
  const auth: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  if (!auth.isAuthenticated())
    return router.createUrlTree(['/admin/login']);

  if (!AdminTabAccessUtil.canAccess(AdminTab.Overview, auth.getRoles()))
    return router.createUrlTree(['/admin/access-denied']);

  return true;
};
