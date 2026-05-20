import { Gift } from './gift.model';

export interface GuestGiftState {
  gifts: Gift[];
  loading: boolean;
  error: string;
}
