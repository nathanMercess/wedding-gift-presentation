import { Couple } from './couple.model';

export interface CoupleState {
  couple: Couple;
  loading: boolean;
  saving: boolean;
  success: boolean;
  error: string;
}
