import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminOperationsService } from '../../../services/admin-operations.service';

@Component({
  standalone: true,
  selector: 'app-admin-overview',
  templateUrl: './admin-overview.component.html',
  styleUrl: './admin-overview.component.scss',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOverviewComponent implements OnInit {
  public selectedDays: number = 30;

  public constructor(public readonly operations: AdminOperationsService) {}

  public ngOnInit(): void {
    this.load();
  }

  public load(): void {
    this.operations.loadOverview(this.selectedDays);
  }
}
