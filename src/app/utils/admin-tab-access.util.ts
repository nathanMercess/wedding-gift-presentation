import { AdminTab } from '../enums/admin-tab.enum';
import { UserRole } from '../enums/user-role.enum';

export abstract class AdminTabAccessUtil {
  public static accessibleTabs(roles: string[]): AdminTab[] {
    return Object.values(AdminTab).filter((tab: AdminTab): boolean => this.canAccess(tab, roles));
  }

  public static canAccess(tab: AdminTab, roles: string[]): boolean {
    if (roles.includes(UserRole.SuperAdmin))
      return true;

    if (roles.includes(UserRole.Admin))
      return tab !== AdminTab.Users;

    if (!roles.includes(UserRole.Member))
      return false;

    return tab !== AdminTab.Contributions && tab !== AdminTab.Payments && tab !== AdminTab.Users;
  }
}
