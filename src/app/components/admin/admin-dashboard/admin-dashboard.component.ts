import { Component, OnDestroy, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, interval, takeUntil } from 'rxjs';
import { EMPTY_GIFT } from '../../../constants/empty-gift.constant';
import { Gift } from '../../../models/gift.model';
import { GiftService } from '../../../services/gift.service';
import { CoupleService } from '../../../services/couple.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { AdminGiftCardComponent } from '../admin-gift-card/admin-gift-card.component';
import { AdminGiftFormComponent } from '../admin-gift-form/admin-gift-form.component';
import { AdminCoupleFormComponent } from '../admin-couple-form/admin-couple-form.component';
import { SlideOverComponent } from '../../slide-over/slide-over.component';
import { AdminTab } from '../../../enums/admin-tab.enum';
import { UserRole } from '../../../enums/user-role.enum';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.scss',
    imports: [CommonModule, FormsModule, RouterLink, ConfirmDialogComponent, AdminGiftCardComponent, AdminGiftFormComponent, AdminCoupleFormComponent, SlideOverComponent]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  public readonly AdminTab: typeof AdminTab = AdminTab;

  public activeTab: AdminTab = AdminTab.Gifts;
  public showGiftForm: boolean = false;
  public editingGift: Gift = EMPTY_GIFT;
  public giftPendingDeletion: Gift = EMPTY_GIFT;
  public showDeleteConfirm: boolean = false;
  public searchTerm: string = '';

  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();
  private readonly pollIntervalMs: number = 15000;

  public constructor(
    public readonly giftService: GiftService,
    public readonly coupleService: CoupleService,
    public readonly auth: AuthService,
  ) {
    effect((): void => {
      if (this.giftService.adminState().giftSaved) {
        this.showGiftForm = false;
        this.editingGift = EMPTY_GIFT;
        this.giftService.resetAdminGiftSaved();
      }
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

  public get isEditingGift(): boolean {
    return this.editingGift.id.trim().length > 0;
  }

  public ngOnInit(): void {
    this.loadGifts();
    this.coupleService.loadCouple();
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

  public closeGiftForm(): void {
    this.showGiftForm = false;
    this.editingGift = EMPTY_GIFT;
    this.giftService.clearAdminGiftError();
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
