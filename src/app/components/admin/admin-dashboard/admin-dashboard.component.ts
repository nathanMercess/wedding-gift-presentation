import { Component, HostListener, OnDestroy, OnInit, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, interval, takeUntil } from 'rxjs';
import { EMPTY_GIFT } from '../../../constants/empty-gift.constant';
import { Gift } from '../../../models/gift.model';
import { AdminContribution } from '../../../models/admin-contribution.model';
import { GiftService } from '../../../services/gift.service';
import { CoupleService } from '../../../services/couple.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { AdminGiftCardComponent } from '../admin-gift-card/admin-gift-card.component';
import { AdminGiftFormComponent } from '../admin-gift-form/admin-gift-form.component';
import { AdminCoupleFormComponent } from '../admin-couple-form/admin-couple-form.component';
import { AdminContributionsComponent } from '../admin-contributions/admin-contributions.component';
import { SlideOverComponent } from '../../slide-over/slide-over.component';
import { AdminOverviewComponent } from '../admin-overview/admin-overview.component';
import { AdminPaymentsComponent } from '../admin-payments/admin-payments.component';
import { AdminShowcaseComponent } from '../admin-showcase/admin-showcase.component';
import { AdminUsersComponent } from '../admin-users/admin-users.component';
import { AdminTab } from '../../../enums/admin-tab.enum';
import { GiftCategory } from '../../../enums/gift-category.enum';
import { UserRole } from '../../../enums/user-role.enum';
import { ToastService } from '../../../services/toast.service';
import { AdminOperationsService } from '../../../services/admin-operations.service';
import { GiftImportUtil } from '../../../utils/gift-import.util';
import { AdminTabAccessUtil } from '../../../utils/admin-tab-access.util';
import { AdminGuestsComponent } from '../admin-guests/admin-guests.component';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  imports: [CommonModule, FormsModule, RouterLink, ConfirmDialogComponent, AdminGiftCardComponent, AdminGiftFormComponent, AdminCoupleFormComponent, AdminContributionsComponent, AdminOverviewComponent, AdminGuestsComponent, AdminPaymentsComponent, AdminShowcaseComponent, AdminUsersComponent, SlideOverComponent],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  public readonly AdminTab: typeof AdminTab = AdminTab;
  public readonly categoryOptions: GiftCategory[] = Object.values(GiftCategory);

  public activeTab: AdminTab = AdminTab.Overview;
  public showGiftForm: boolean = false;
  public editingGift: Gift = EMPTY_GIFT;
  public giftPendingDeletion: Gift = EMPTY_GIFT;
  public showDeleteConfirm: boolean = false;
  public showBulkDeleteConfirm: boolean = false;
  public showDiscardConfirm: boolean = false;
  public pendingTab: AdminTab | null = null;
  public searchTerm: string = '';
  public selectedGiftIds: Set<string> = new Set<string>();
  public bulkCategory: GiftCategory | null = null;
  public loadDraftOnCoupleOpen: boolean = false;

  @ViewChild(AdminGiftFormComponent) public giftForm?: AdminGiftFormComponent;
  @ViewChild(AdminCoupleFormComponent) public coupleForm?: AdminCoupleFormComponent;

  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();
  private readonly pollIntervalMs: number = 15000;

  public constructor(
    public readonly giftService: GiftService,
    public readonly coupleService: CoupleService,
    public readonly auth: AuthService,
    public readonly toast: ToastService,
    public readonly operations: AdminOperationsService,
  ) {
    effect((): void => {
      if (!this.giftService.adminState().giftSaved)
        return;

      this.showGiftForm = false;
      this.editingGift = EMPTY_GIFT;
      this.giftService.resetAdminGiftSaved();
    }, { allowSignalWrites: true });

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe((): void => this.loadGifts(1));

    interval(this.pollIntervalMs).pipe(takeUntil(this.destroy$)).subscribe((): void => this.pollGifts());
  }

  public get currentPage(): number {
    return this.giftService.adminState().currentPage;
  }

  public get totalPages(): number {
    return this.giftService.adminState().totalPages;
  }

  public get totalCount(): number {
    return this.giftService.adminState().totalCount;
  }

  public get isSuperAdmin(): boolean {
    return this.auth.hasRole(UserRole.SuperAdmin);
  }

  public get accessibleTabs(): AdminTab[] {
    return AdminTabAccessUtil.accessibleTabs(this.auth.getRoles());
  }

  public canAccessTab(tab: AdminTab): boolean {
    return AdminTabAccessUtil.canAccess(tab, this.auth.getRoles());
  }

  public tabLabel(tab: AdminTab): string {
    if (tab === AdminTab.Overview)
      return 'Resumo';

    if (tab === AdminTab.Gifts)
      return 'Presentes';

    if (tab === AdminTab.Guests)
      return 'Convidados';

    if (tab === AdminTab.Contributions)
      return 'Contribuições';

    if (tab === AdminTab.Payments)
      return 'Pagamentos';

    if (tab === AdminTab.Showcase)
      return 'Vitrine';

    if (tab === AdminTab.Couple)
      return 'Casal';

    return 'Usuários';
  }

  public get isEditingGift(): boolean {
    return this.editingGift.id.trim().length > 0;
  }

  public get hasUnsavedChanges(): boolean {
    return !!this.giftForm?.isDirty || !!this.coupleForm?.isDirty;
  }

  public get selectedGifts(): Gift[] {
    return this.giftService.adminState().gifts.filter((gift: Gift): boolean => this.selectedGiftIds.has(gift.id));
  }

  public get unreadMessageCount(): number {
    return this.operations.state().contributions.filter((contribution: AdminContribution): boolean => !!contribution.message && !contribution.messageReadAtUtc && !contribution.messageArchivedAtUtc).length;
  }

  public ngOnInit(): void {
    this.loadGifts();
    this.coupleService.loadCouple();

    if (!this.canAccessTab(AdminTab.Contributions))
      return;

    this.operations.loadContributions({ hasMessage: true, page: 1, pageSize: 100 });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public loadGifts(page: number = this.currentPage): void {
    this.giftService.loadAdminGifts({
      search: this.searchTerm || undefined,
      page,
      pageSize: 20,
    });
  }

  public onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  public onFilterChange(): void {
    this.loadGifts(1);
  }

  public onPageChange(page: number): void {
    this.loadGifts(page);
  }

  public openNewGift(): void {
    this.editingGift = EMPTY_GIFT;
    this.showGiftForm = true;
  }

  public openEditGift(gift: Gift): void {
    this.editingGift = gift;
    this.showGiftForm = true;
  }

  public duplicateGift(gift: Gift): void {
    this.giftService.duplicateAdminGift(gift);
  }

  public toggleGiftSelection(gift: Gift, selected: boolean): void {
    const nextSelection: Set<string> = new Set(this.selectedGiftIds);

    if (selected)
      nextSelection.add(gift.id);

    if (!selected)
      nextSelection.delete(gift.id);

    this.selectedGiftIds = nextSelection;
  }

  public toggleAllDisplayed(selected: boolean): void {
    this.selectedGiftIds = selected ? new Set(this.giftService.adminState().gifts.map((gift: Gift): string => gift.id)) : new Set<string>();
  }

  public applyBulkCategory(): void {
    this.giftService.saveAdminGiftsBatch(this.selectedGifts, this.bulkCategory, (): void => {
      this.selectedGiftIds = new Set<string>();
      this.toast.success('Categoria atualizada nos presentes selecionados.');
    });
  }

  public requestBulkDelete(): void {
    if (this.selectedGiftIds.size === 0)
      return;

    this.showBulkDeleteConfirm = true;
  }

  public confirmBulkDelete(): void {
    this.showBulkDeleteConfirm = false;
    this.giftService.deleteAdminGiftsBatch(this.selectedGifts, (): void => {
      this.selectedGiftIds = new Set<string>();
      this.toast.success('Presentes removidos.');
    });
  }

  public cancelBulkDelete(): void {
    this.showBulkDeleteConfirm = false;
  }

  public async onGiftImport(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file: File | undefined = input.files?.[0];
    input.value = '';

    if (!file)
      return;

    const gifts: Array<Partial<Gift>> = GiftImportUtil.parse(await file.text());

    if (gifts.length === 0) {
      this.toast.error('A planilha não contém presentes válidos.');
      return;
    }

    this.giftService.createAdminGiftsBatch(gifts, (): void => this.toast.success(`${gifts.length} presente${gifts.length === 1 ? '' : 's'} importado${gifts.length === 1 ? '' : 's'}.`));
  }

  public requestTabChange(tab: AdminTab): void {
    if (!this.canAccessTab(tab))
      return;

    if (tab === this.activeTab)
      return;

    if (this.hasUnsavedChanges) {
      this.pendingTab = tab;
      this.showDiscardConfirm = true;
      return;
    }

    this.activeTab = tab;
  }

  public openShowcase(): void {
    this.loadDraftOnCoupleOpen = true;
    this.activeTab = AdminTab.Showcase;
  }

  public openShowcaseEditor(): void {
    this.activeTab = AdminTab.Couple;
  }

  public requestCloseGiftForm(): void {
    if (this.showDiscardConfirm)
      return;

    if (this.giftForm?.isDirty) {
      this.pendingTab = null;
      this.showDiscardConfirm = true;
      return;
    }

    this.closeGiftForm();
  }

  public closeGiftForm(): void {
    this.showGiftForm = false;
    this.editingGift = EMPTY_GIFT;
    this.giftService.clearAdminGiftError();
  }

  public confirmDiscardChanges(): void {
    const nextTab: AdminTab | null = this.pendingTab;

    this.showDiscardConfirm = false;
    this.pendingTab = null;
    this.coupleForm?.discardChanges();

    if (nextTab === null) {
      this.closeGiftForm();
      return;
    }

    this.showGiftForm = false;
    this.editingGift = EMPTY_GIFT;
    this.giftService.clearAdminGiftError();
    this.activeTab = nextTab;
  }

  public cancelDiscardChanges(): void {
    this.showDiscardConfirm = false;
    this.pendingTab = null;
  }

  @HostListener('window:beforeunload', ['$event'])
  public onBeforeUnload(event: BeforeUnloadEvent): void {
    if (!this.hasUnsavedChanges)
      return;

    event.preventDefault();
    event.returnValue = '';
  }

  private pollGifts(): void {
    if (this.activeTab !== AdminTab.Gifts)
      return;

    if (this.showGiftForm)
      return;

    if (document.hidden)
      return;

    this.giftService.refreshAdminGiftsSilently({
      search: this.searchTerm || undefined,
      page: this.currentPage,
      pageSize: 20,
    });
  }

  public requestDeleteGift(gift: Gift): void {
    this.giftPendingDeletion = gift;
    this.showDeleteConfirm = true;
  }

  public confirmDeleteGift(): void {
    const giftId: string = this.giftPendingDeletion.id;

    this.showDeleteConfirm = false;
    this.giftPendingDeletion = EMPTY_GIFT;

    if (!giftId)
      return;

    this.giftService.deleteAdminGift(giftId);
  }

  public cancelDeleteGift(): void {
    this.showDeleteConfirm = false;
    this.giftPendingDeletion = EMPTY_GIFT;
  }

  public trackByGiftId(_: number, gift: Gift): string {
    return gift.id;
  }

  public logout(): void {
    this.auth.logout();
  }
}
