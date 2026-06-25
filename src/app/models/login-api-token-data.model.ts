import { UserRole } from '../enums/user-role.enum';

export interface LoginApiTokenData {
  accessToken: string;
  expiresAtUtc: string;
  userName: string;
  email: string;
  role: UserRole;
}
