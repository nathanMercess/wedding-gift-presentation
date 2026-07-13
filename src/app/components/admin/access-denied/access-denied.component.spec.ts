import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '../../../services/auth.service';
import { AccessDeniedComponent } from './access-denied.component';

describe('AccessDeniedComponent', () => {
  let fixture: ComponentFixture<AccessDeniedComponent>;
  let auth: Pick<AuthService, 'logout'>;

  beforeEach((): void => {
    auth = { logout: jest.fn() };
    TestBed.configureTestingModule({
      imports: [AccessDeniedComponent],
      providers: [{ provide: AuthService, useValue: auth }],
    });
    fixture = TestBed.createComponent(AccessDeniedComponent);
    fixture.detectChanges();
  });

  it('encerra a sessao ao voltar para o login', (): void => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.back-link');

    button.click();

    expect(auth.logout).toHaveBeenCalledTimes(1);
  });
});
