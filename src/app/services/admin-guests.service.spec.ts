import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { AdminGuestsService } from './admin-guests.service';

describe('AdminGuestsService', () => {
  let service: AdminGuestsService;
  let http: HttpTestingController;

  beforeEach((): void => {
    TestBed.configureTestingModule({ providers: [AdminGuestsService, provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AdminGuestsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach((): void => http.verify());

  it('envia o arquivo CSV como formulário multipart', () => {
    const file: File = new File(['Nome\nMariana Silva'], 'convidados.csv', { type: 'text/csv' });
    service.importInvitations(file, (): void => undefined);
    const request = http.expectOne(`${environment.apiUrl}/admin/guests/invitations/import`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeInstanceOf(FormData);
    expect((request.request.body as FormData).get('file')).toBe(file);
    request.flush({ success: true, data: { createdCount: 1, skippedCount: 0 }, error: null, correlationId: 'test' });
    http.expectOne(`${environment.apiUrl}/admin/guests/summary`).flush({ success: true, data: { invitationCount: 1, pendingInvitationCount: 1, confirmationCount: 0, confirmedGuestCount: 0, freeTextGuestCount: 0 }, error: null, correlationId: 'test' });
  });

  it('trata resposta 204 de exclusão como sucesso', () => {
    let completed: boolean = false;
    service.deleteConfirmation('confirmation-id', (): void => { completed = true; });
    http.expectOne(`${environment.apiUrl}/admin/guests/confirmations/confirmation-id`).flush(null, { status: 204, statusText: 'No Content' });
    http.expectOne(`${environment.apiUrl}/admin/guests/summary`).flush({ success: true, data: { invitationCount: 0, pendingInvitationCount: 0, confirmationCount: 0, confirmedGuestCount: 0, freeTextGuestCount: 0 }, error: null, correlationId: 'test' });
    expect(completed).toBe(true);
  });
});
