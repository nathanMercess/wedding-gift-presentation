import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserRole } from '../../../enums/user-role.enum';
import { AdminUser } from '../../../models/admin-user.model';
import { AdminOperationsService } from '../../../services/admin-operations.service';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

@Component({
  standalone: true,
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersComponent implements OnInit {
  public readonly UserRole: typeof UserRole = UserRole;
  public readonly roleOptions: UserRole[] = [UserRole.Member, UserRole.Admin, UserRole.SuperAdmin];
  public searchTerm: string = '';
  public currentPage: number = 1;
  public showDeactivateConfirm: boolean = false;
  public userPendingDeactivation: AdminUser | null = null;

  public constructor(public readonly operations: AdminOperationsService) {}

  public ngOnInit(): void {
    this.load();
  }

  public load(page: number = 1): void {
    this.currentPage = page;
    this.operations.loadUsers({ search: this.searchTerm.trim() || undefined, page, pageSize: 20 });
  }

  public changeRole(user: AdminUser, role: UserRole): void {
    if (user.role === role)
      return;

    this.operations.updateUserRole(user, role);
  }

  public toggleActive(user: AdminUser): void {
    if (!user.isActive) {
      this.operations.updateUserActive(user, true);
      return;
    }

    this.userPendingDeactivation = user;
    this.showDeactivateConfirm = true;
  }

  public confirmDeactivate(): void {
    const user: AdminUser | null = this.userPendingDeactivation;
    this.showDeactivateConfirm = false;
    this.userPendingDeactivation = null;

    if (!user)
      return;

    this.operations.updateUserActive(user, false);
  }

  public cancelDeactivate(): void {
    this.showDeactivateConfirm = false;
    this.userPendingDeactivation = null;
  }

  public trackByUser(_: number, user: AdminUser): string {
    return user.id;
  }
}
