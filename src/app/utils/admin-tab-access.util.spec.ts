import { AdminTab } from '../enums/admin-tab.enum';
import { UserRole } from '../enums/user-role.enum';
import { AdminTabAccessUtil } from './admin-tab-access.util';

describe('AdminTabAccessUtil', () => {
  it('permite todas as abas para superadministrador', () => {
    Object.values(AdminTab).forEach((tab: AdminTab): void => {
      expect(AdminTabAccessUtil.canAccess(tab, [UserRole.SuperAdmin])).toBe(true);
    });
  });

  it('permite operacao do casal para administrador sem liberar usuarios', () => {
    expect(AdminTabAccessUtil.canAccess(AdminTab.Overview, [UserRole.Admin])).toBe(true);
    expect(AdminTabAccessUtil.canAccess(AdminTab.Gifts, [UserRole.Admin])).toBe(true);
    expect(AdminTabAccessUtil.canAccess(AdminTab.Contributions, [UserRole.Admin])).toBe(true);
    expect(AdminTabAccessUtil.canAccess(AdminTab.Payments, [UserRole.Admin])).toBe(true);
    expect(AdminTabAccessUtil.canAccess(AdminTab.Couple, [UserRole.Admin])).toBe(true);
    expect(AdminTabAccessUtil.canAccess(AdminTab.Users, [UserRole.Admin])).toBe(false);
  });

  it('nao permite abas administrativas para membro', () => {
    Object.values(AdminTab).forEach((tab: AdminTab): void => {
      expect(AdminTabAccessUtil.canAccess(tab, [UserRole.Member])).toBe(false);
    });
  });
});
