import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent implements OnDestroy {
  public email: string = '';
  public submitted: boolean = false;

  public constructor(public readonly auth: AuthService) {
    this.auth.resetLoginState();
  }

  public ngOnDestroy(): void {
    this.auth.resetLoginState();
  }

  public submit(): void {
    this.submitted = true;

    if (!this.email.trim())
      return;

    this.auth.requestPasswordReset(this.email.trim());
  }
}
