import { LoginApiTokenData } from './login-api-token-data.model';

export interface LoginApiResponse extends LoginApiTokenData {
  data?: LoginApiTokenData;
}
