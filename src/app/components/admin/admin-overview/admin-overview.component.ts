import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CoupleOverview, CoupleOverviewDailyAmount } from '../../../models/couple-overview.model';
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

  public get overview(): CoupleOverview | null {
    return this.operations.state().overview;
  }

  public get fundingPercent(): number {
    const overview: CoupleOverview | null = this.overview;

    if (!overview || overview.goal <= 0)
      return 0;

    return Math.min((overview.totalRaised / overview.goal) * 100, 100);
  }

  public get periodRaised(): number {
    return this.overview?.dailyApprovedAmounts.reduce((total: number, item: CoupleOverviewDailyAmount): number => total + item.amount, 0) ?? 0;
  }

  public get remainingAmount(): number {
    const overview: CoupleOverview | null = this.overview;

    if (!overview)
      return 0;

    return Math.max(overview.goal - overview.totalRaised, 0);
  }

  public ngOnInit(): void {
    this.load();
  }

  public load(): void {
    this.operations.loadOverview(this.selectedDays);
  }
}
