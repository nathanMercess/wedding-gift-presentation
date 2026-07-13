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
    expect(AdminTabAccessUtil.canAccess(AdminTab.Showcase, [UserRole.Admin])).toBe(true);
    expect(AdminTabAccessUtil.canAccess(AdminTab.Couple, [UserRole.Admin])).toBe(true);
    expect(AdminTabAccessUtil.canAccess(AdminTab.Users, [UserRole.Admin])).toBe(false);
  });

  it('permite somente as abas basicas para membro', () => {
    expect(AdminTabAccessUtil.canAccess(AdminTab.Overview, [UserRole.Member])).toBe(true);
    expect(AdminTabAccessUtil.canAccess(AdminTab.Gifts, [UserRole.Member])).toBe(true);
    expect(AdminTabAccessUtil.canAccess(AdminTab.Contributions, [UserRole.Member])).toBe(false);
    expect(AdminTabAccessUtil.canAccess(AdminTab.Showcase, [UserRole.Member])).toBe(true);
    expect(AdminTabAccessUtil.canAccess(AdminTab.Couple, [UserRole.Member])).toBe(true);
    expect(AdminTabAccessUtil.canAccess(AdminTab.Payments, [UserRole.Member])).toBe(false);
    expect(AdminTabAccessUtil.canAccess(AdminTab.Users, [UserRole.Member])).toBe(false);
  });

  it('retorna somente as abas visiveis para membro', () => {
    expect(AdminTabAccessUtil.accessibleTabs([UserRole.Member])).toEqual([
      AdminTab.Overview,
      AdminTab.Gifts,
      AdminTab.Showcase,
      AdminTab.Couple,
    ]);
  });

  it('retorna todas as abas para superadministrador', () => {
    expect(AdminTabAccessUtil.accessibleTabs([UserRole.SuperAdmin])).toEqual(Object.values(AdminTab));
  });

  it('nao permite abas administrativas sem role conhecida', () => {
    expect(AdminTabAccessUtil.canAccess(AdminTab.Overview, [])).toBe(false);
  });
});
