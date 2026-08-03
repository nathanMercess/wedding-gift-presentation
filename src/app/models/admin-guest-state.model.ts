import { GuestConfirmation, GuestInvitation, GuestSummary } from './guest.model';

export interface AdminGuestState {
  summary: GuestSummary | null;
  invitations: GuestInvitation[];
  invitationTotal: number;
  invitationPages: number;
  confirmations: GuestConfirmation[];
  confirmationTotal: number;
  confirmationPages: number;
  loading: boolean;
  actionLoading: boolean;
  error: string;
}
