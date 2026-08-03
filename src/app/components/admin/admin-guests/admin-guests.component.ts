import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminGuestView } from '../../../enums/admin-guest-view.enum';
import { GuestInvitationStatus } from '../../../enums/guest-invitation-status.enum';
import { GuestSource } from '../../../enums/guest-source.enum';
import { ConfirmedGuest, GuestConfirmation, GuestConfirmationGuestRequest, GuestConfirmationRequest, GuestInvitation, GuestInvitationImportResult } from '../../../models/guest.model';
import { AdminGuestsService, GuestConfirmationQuery, GuestInvitationQuery } from '../../../services/admin-guests.service';
import { ToastService } from '../../../services/toast.service';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

@Component({
  standalone: true,
  selector: 'app-admin-guests',
  templateUrl: './admin-guests.component.html',
  styleUrl: './admin-guests.component.scss',
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminGuestsComponent implements OnInit {
  public readonly AdminGuestView: typeof AdminGuestView = AdminGuestView;
  public readonly GuestInvitationStatus: typeof GuestInvitationStatus = GuestInvitationStatus;
  public readonly GuestSource: typeof GuestSource = GuestSource;
  public activeView: AdminGuestView = AdminGuestView.Invitations;
  public invitationSearch: string = '';
  public invitationStatus: GuestInvitationStatus = GuestInvitationStatus.All;
  public invitationPage: number = 1;
  public confirmationSearch: string = '';
  public confirmationSource: GuestSource | null = null;
  public confirmationFrom: string = '';
  public confirmationTo: string = '';
  public confirmationPage: number = 1;
  public invitationFormOpen: boolean = false;
  public editingInvitationId: string | null = null;
  public invitationName: string = '';
  public invitationPendingDeletion: GuestInvitation | null = null;
  public showInvitationDeleteConfirm: boolean = false;
  public editingConfirmation: GuestConfirmation | null = null;
  public editingGuests: GuestConfirmationGuestRequest[] = [];
  public confirmationPendingDeletion: GuestConfirmation | null = null;
  public showConfirmationDeleteConfirm: boolean = false;

  public constructor(public readonly guestsService: AdminGuestsService, public readonly toast: ToastService) {}

  public ngOnInit(): void {
    this.guestsService.loadSummary();
    this.loadInvitations();
  }

  public changeView(view: AdminGuestView): void {
    this.activeView = view;

    if (view === AdminGuestView.Invitations) {
      this.loadInvitations();
      return;
    }

    this.loadConfirmations();
  }

  public loadInvitations(page: number = 1): void {
    this.invitationPage = page;
    this.guestsService.loadInvitations(this.invitationQuery);
  }

  public loadConfirmations(page: number = 1): void {
    this.confirmationPage = page;
    this.guestsService.loadConfirmations(this.confirmationQuery);
  }

  public openInvitationForm(invitation: GuestInvitation | null = null): void {
    this.editingInvitationId = invitation?.id ?? null;
    this.invitationName = invitation?.name ?? '';
    this.invitationFormOpen = true;
  }

  public closeInvitationForm(): void {
    this.invitationFormOpen = false;
    this.editingInvitationId = null;
    this.invitationName = '';
  }

  public saveInvitation(): void {
    const name: string = this.invitationName.trim();

    if (!name)
      return;

    this.guestsService.saveInvitation(this.editingInvitationId, name, (): void => {
      this.closeInvitationForm();
      this.loadInvitations(this.invitationPage);
      this.toast.success('Convidado salvo.');
    });
  }

  public toggleInvitation(invitation: GuestInvitation): void {
    this.guestsService.setInvitationActive(invitation, (): void => this.loadInvitations(this.invitationPage));
  }

  public requestInvitationDelete(invitation: GuestInvitation): void {
    this.invitationPendingDeletion = invitation;
    this.showInvitationDeleteConfirm = true;
  }

  public confirmInvitationDelete(): void {
    const invitation: GuestInvitation | null = this.invitationPendingDeletion;
    this.cancelInvitationDelete();

    if (!invitation)
      return;

    this.guestsService.deleteInvitation(invitation.id, (): void => {
      this.loadInvitations(this.invitationPage);
      this.guestsService.loadSummary();
      this.toast.success('Convidado removido.');
    });
  }

  public cancelInvitationDelete(): void {
    this.invitationPendingDeletion = null;
    this.showInvitationDeleteConfirm = false;
  }

  public importCsv(event: Event): void {
    const input: HTMLInputElement = event.target as HTMLInputElement;
    const file: File | undefined = input.files?.[0];
    input.value = '';

    if (!file)
      return;

    this.guestsService.importInvitations(file, (result: GuestInvitationImportResult): void => {
      this.loadInvitations(1);
      this.toast.success(`${result.createdCount} convidado(s) importado(s); ${result.skippedCount} ignorado(s).`);
    });
  }

  public openConfirmationEdit(confirmation: GuestConfirmation): void {
    this.editingConfirmation = confirmation;
    this.editingGuests = confirmation.guests.map((guest: ConfirmedGuest): GuestConfirmationGuestRequest => ({
      guestInvitationId: guest.guestInvitationId,
      name: guest.name,
      isSubmitter: guest.isSubmitter,
    }));
  }

  public addEditingGuest(): void {
    if (this.editingGuests.length >= 20)
      return;

    this.editingGuests = [...this.editingGuests, { guestInvitationId: null, name: '', isSubmitter: false }];
  }

  public removeEditingGuest(index: number): void {
    if (this.editingGuests[index].isSubmitter)
      return;

    this.editingGuests = this.editingGuests.filter((_: GuestConfirmationGuestRequest, guestIndex: number): boolean => guestIndex !== index);
  }

  public closeConfirmationEdit(): void {
    this.editingConfirmation = null;
    this.editingGuests = [];
  }

  public saveConfirmation(): void {
    const confirmation: GuestConfirmation | null = this.editingConfirmation;

    if (!confirmation || this.editingGuests.some((guest: GuestConfirmationGuestRequest): boolean => !guest.name.trim()))
      return;

    const request: GuestConfirmationRequest = { guests: this.editingGuests.map((guest: GuestConfirmationGuestRequest): GuestConfirmationGuestRequest => ({ ...guest, name: guest.name.trim() })) };
    this.guestsService.updateConfirmation(confirmation.id, request, (): void => {
      this.closeConfirmationEdit();
      this.loadConfirmations(this.confirmationPage);
      this.toast.success('Confirmação atualizada.');
    });
  }

  public requestConfirmationDelete(confirmation: GuestConfirmation): void {
    this.confirmationPendingDeletion = confirmation;
    this.showConfirmationDeleteConfirm = true;
  }

  public confirmConfirmationDelete(): void {
    const confirmation: GuestConfirmation | null = this.confirmationPendingDeletion;
    this.cancelConfirmationDelete();

    if (!confirmation)
      return;

    this.guestsService.deleteConfirmation(confirmation.id, (): void => {
      this.loadConfirmations(this.confirmationPage);
      this.toast.success('Confirmação excluída; os convites foram liberados.');
    });
  }

  public cancelConfirmationDelete(): void {
    this.confirmationPendingDeletion = null;
    this.showConfirmationDeleteConfirm = false;
  }

  public exportConfirmations(): void {
    this.guestsService.exportConfirmations(this.confirmationQuery).subscribe({
      next: (blob: Blob): void => {
        const url: string = URL.createObjectURL(blob);
        const anchor: HTMLAnchorElement = document.createElement('a');
        anchor.href = url;
        anchor.download = `confirmacoes-${new Date().toISOString().slice(0, 10)}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
      },
      error: (): void => this.toast.error('Não foi possível exportar as confirmações.'),
    });
  }

  public sourceLabel(source: GuestSource): string {
    return source === GuestSource.RegisteredList ? 'Da lista' : 'Texto livre';
  }

  public trackByInvitation(_: number, invitation: GuestInvitation): string {
    return invitation.id;
  }

  public trackByConfirmation(_: number, confirmation: GuestConfirmation): string {
    return confirmation.id;
  }

  private get invitationQuery(): GuestInvitationQuery {
    return { search: this.invitationSearch.trim() || undefined, status: this.invitationStatus || undefined, page: this.invitationPage, pageSize: 20 };
  }

  private get confirmationQuery(): GuestConfirmationQuery {
    return {
      search: this.confirmationSearch.trim() || undefined,
      source: this.confirmationSource ?? undefined,
      fromUtc: this.confirmationFrom ? new Date(`${this.confirmationFrom}T00:00:00`).toISOString() : undefined,
      toUtc: this.confirmationTo ? new Date(`${this.confirmationTo}T23:59:59`).toISOString() : undefined,
      page: this.confirmationPage,
      pageSize: 20,
    };
  }
}
