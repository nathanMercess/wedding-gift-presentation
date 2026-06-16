import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
  imports: [CommonModule, FormsModule]
})
export class AdminLoginComponent {
  public email: string = '';
  public password: string = '';

  public constructor(public readonly auth: AuthService, public readonly router: Router) {
    effect((): void => {
      if (this.auth.loginState().success) {
        this.router.navigate(['/admin']);
        this.auth.resetLoginState();
      }
    });
  }

  public onSubmit(): void {
    if (!this.email || !this.password) 
      return;
    
    this.auth.authenticate({ email: this.email, password: this.password });
  }
}
