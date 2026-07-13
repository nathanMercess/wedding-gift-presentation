import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-access-denied',
  templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.scss',
  imports: [],
})
export class AccessDeniedComponent {
  public constructor(public readonly auth: AuthService) {}

  public backToLogin(): void {
    this.auth.logout();
  }
}
