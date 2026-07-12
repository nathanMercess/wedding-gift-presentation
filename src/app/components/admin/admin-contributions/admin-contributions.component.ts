import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContributionStatus } from '../../../enums/contribution-status.enum';
import { AdminContribution } from '../../../models/admin-contribution.model';
import { AdminContributionQuery, AdminOperationsService } from '../../../services/admin-operations.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  standalone: true,
  selector: 'app-admin-contributions',
  templateUrl: './admin-contributions.component.html',
  styleUrl: './admin-contributions.component.scss',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminContributionsComponent implements OnInit {
  public readonly ContributionStatus: typeof ContributionStatus = ContributionStatus;
  public readonly statusOptions: ContributionStatus[] = [ContributionStatus.All, ContributionStatus.Paid, ContributionStatus.Pending, ContributionStatus.Cancelled, ContributionStatus.Refunded, ContributionStatus.Chargeback];
  public searchTerm: string = '';
  public selectedStatus: ContributionStatus = ContributionStatus.All;
  public onlyMessages: boolean = false;
  public currentPage: number = 1;

  public constructor(public readonly operations: AdminOperationsService, public readonly toast: ToastService) {}

  public ngOnInit(): void {
    this.load();
  }

  public load(page: number = 1): void {
    this.currentPage = page;
    this.operations.loadContributions(this.query);
  }

  public export(): void {
    this.operations.exportContributions(this.query).subscribe({
      next: (blob: Blob): void => {
        const url: string = URL.createObjectURL(blob);
        const anchor: HTMLAnchorElement = document.createElement('a');
        anchor.href = url;
        anchor.download = `contribuicoes-${new Date().toISOString().slice(0, 10)}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
      },
      error: (): void => this.toast.error('Não foi possível exportar as contribuições.'),
    });
  }

  public markRead(contribution: AdminContribution): void {
    this.operations.markMessageRead(contribution, !contribution.messageReadAtUtc);
  }

  public archive(contribution: AdminContribution): void {
    this.operations.archiveMessage(contribution, !contribution.messageArchivedAtUtc);
  }

  public async copyMessage(contribution: AdminContribution): Promise<void> {
    try {
      await navigator.clipboard.writeText(contribution.message);
      this.toast.success('Mensagem copiada.');
    } catch {
      this.toast.error('Não foi possível copiar a mensagem.');
    }
  }

  public trackByContribution(_: number, contribution: AdminContribution): string {
    return contribution.id;
  }

  public statusLabel(status: ContributionStatus): string {
    if (status === ContributionStatus.All)
      return 'Todos';

    if (status === ContributionStatus.Paid)
      return 'Pago';

    if (status === ContributionStatus.Pending)
      return 'Pendente';

    if (status === ContributionStatus.Cancelled)
      return 'Cancelado';

    if (status === ContributionStatus.Refunded)
      return 'Estornado';

    return 'Chargeback';
  }

  private get query(): AdminContributionQuery {
    return {
      search: this.searchTerm.trim() || undefined,
      status: this.selectedStatus || undefined,
      hasMessage: this.onlyMessages || undefined,
      page: this.currentPage,
      pageSize: 20,
    };
  }
}
