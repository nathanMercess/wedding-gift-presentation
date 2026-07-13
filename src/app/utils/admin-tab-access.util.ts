import { AdminTab } from '../enums/admin-tab.enum';
import { UserRole } from '../enums/user-role.enum';

export abstract class AdminTabAccessUtil {
  public static canAccess(tab: AdminTab, roles: string[]): boolean {
    if (roles.includes(UserRole.SuperAdmin))
      return true;

    if (!roles.includes(UserRole.Admin))
      return false;

    return tab !== AdminTab.Users;
  }
}
