import { GuestSource } from '../enums/guest-source.enum';

export interface GuestSuggestion {
  id: string;
  name: string;
}

export interface GuestConfirmationGuestRequest {
  guestInvitationId: string | null;
  name: string;
  isSubmitter: boolean;
}

export interface GuestConfirmationRequest {
  guests: GuestConfirmationGuestRequest[];
}

export interface ConfirmedGuest {
  id: string;
  guestInvitationId: string | null;
  name: string;
  source: GuestSource;
  isSubmitter: boolean;
}

export interface GuestConfirmation {
  id: string;
  confirmedAtUtc: string;
  updatedAtUtc: string;
  partySize: number;
  submittedByName: string;
  guests: ConfirmedGuest[];
}

export interface GuestInvitation {
  id: string;
  name: string;
  isActive: boolean;
  isConfirmed: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface GuestSummary {
  invitationCount: number;
  pendingInvitationCount: number;
  confirmationCount: number;
  confirmedGuestCount: number;
  freeTextGuestCount: number;
}

export interface GuestInvitationImportResult {
  createdCount: number;
  skippedCount: number;
}

export interface GuestDraft {
  name: string;
  guestInvitationId: string | null;
  suggestions: GuestSuggestion[];
  suggestionsOpen: boolean;
  activeSuggestionIndex: number;
}
