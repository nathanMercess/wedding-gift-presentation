import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
  imports: [CommonModule, FormsModule, RouterLink],
})
export class AdminLoginComponent {
  public email: string = '';
  public password: string = '';
  public submitted: boolean = false;

  public constructor(public readonly auth: AuthService, public readonly router: Router) {
    effect((): void => {
      if (this.auth.loginState().success) {
        this.router.navigate(['/admin']);
        this.auth.resetLoginState();
      }
    }, { allowSignalWrites: true });
  }

  public onSubmit(): void {
    this.submitted = true;

    if (!this.email.trim() || !this.password)
      return;

    this.auth.authenticate({ email: this.email, password: this.password });
  }

  public get showEmailRequired(): boolean {
    return this.submitted && !this.email.trim();
  }

  public get showPasswordRequired(): boolean {
    return this.submitted && !this.password;
  }
}
