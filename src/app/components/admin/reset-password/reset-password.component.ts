import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: '../forgot-password/forgot-password.component.scss',
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  public email: string = '';
  public token: string = '';
  public password: string = '';
  public confirmation: string = '';
  public submitted: boolean = false;

  public constructor(public readonly auth: AuthService, public readonly route: ActivatedRoute) {}

  public get hasValidRequest(): boolean {
    return Boolean(this.email && this.token);
  }

  public ngOnInit(): void {
    this.auth.resetLoginState();
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  public ngOnDestroy(): void {
    this.auth.resetLoginState();
  }

  public submit(): void {
    this.submitted = true;

    if (!this.hasValidRequest || this.password.length < 8 || this.password !== this.confirmation)
      return;

    this.auth.resetPassword(this.email, this.token, this.password);
  }
}
