import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { GuestConfirmationRequest } from '../models/guest.model';
import { GuestConfirmationService } from './guest-confirmation.service';

describe('GuestConfirmationService', () => {
  let service: GuestConfirmationService;
  let http: HttpTestingController;

  beforeEach((): void => {
    TestBed.configureTestingModule({ providers: [GuestConfirmationService, provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(GuestConfirmationService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach((): void => http.verify());

  it('busca sugestões com o texto informado', () => {
    service.getSuggestions('Mari').subscribe((suggestions): void => expect(suggestions[0].name).toBe('Mariana Silva'));
    const request = http.expectOne(`${environment.apiUrl}/guest-confirmations/suggestions?search=Mari`);
    expect(request.request.method).toBe('GET');
    request.flush({ success: true, data: [{ id: '1', name: 'Mariana Silva' }], error: null, correlationId: 'test' });
  });

  it('envia todo o grupo em uma única requisição', () => {
    const payload: GuestConfirmationRequest = { guests: [{ guestInvitationId: '1', name: 'Mariana Silva', isSubmitter: true }, { guestInvitationId: null, name: 'João Silva', isSubmitter: false }] };
    service.confirm(payload);
    const request = http.expectOne(`${environment.apiUrl}/guest-confirmations`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ success: true, data: { id: 'c1', confirmedAtUtc: '2026-08-03T17:00:00Z', updatedAtUtc: '2026-08-03T17:00:00Z', partySize: 2, submittedByName: 'Mariana Silva', guests: [] }, error: null, correlationId: 'test' });
    expect(service.state().confirmation?.partySize).toBe(2);
  });
});
