import { GuestConfirmation } from './guest.model';

export interface GuestConfirmationState {
  submitting: boolean;
  error: string;
  confirmation: GuestConfirmation | null;
}
