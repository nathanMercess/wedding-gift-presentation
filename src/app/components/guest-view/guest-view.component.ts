import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, WritableSignal, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { EMPTY_GIFT } from '../../constants/empty-gift.constant';
import { DEFAULT_SITE_SETTINGS } from '../../constants/default-site-settings.constant';
import { SORT_OPTIONS, SortOption } from '../../constants/sort-options.constant';
import { PendingPayment } from '../../checkout/models/pending-payment.model';
import { PaymentResumeService } from '../../checkout/services/payment-resume.service';
import { PaymentStatusUtil } from '../../checkout/utils/payment-status.util';
import { GiftCategory } from '../../enums/gift-category.enum';
import { GiftDisplayMode } from '../../enums/gift-display-mode.enum';
import { CarouselPhoto, Couple, CoupleSiteSettings } from '../../models/couple.model';
import { Gift } from '../../models/gift.model';
import { CoupleService } from '../../services/couple.service';
import { CoupleDraftService } from '../../services/couple-draft.service';
import { GiftService } from '../../services/gift.service';
import { ToastService } from '../../services/toast.service';
import { DateUtil } from '../../utils/date.util';
import { CountdownComponent } from '../countdown/countdown.component';
import { GiftCardComponent } from '../gift-card/gift-card.component';
import { GiftDetailsModalComponent } from '../gift-details-modal/gift-details-modal.component';
import { GuestConfirmationModalComponent } from '../guest-confirmation-modal/guest-confirmation-modal.component';

@Component({
  standalone: true,
  selector: 'app-guest-view',
  templateUrl: './guest-view.component.html',
  styleUrl: './guest-view.component.scss',
  imports: [CommonModule, FormsModule, RouterLink, GiftCardComponent, GiftDetailsModalComponent, CountdownComponent, GuestConfirmationModalComponent],
})
export class GuestViewComponent implements OnInit, OnDestroy, AfterViewChecked {
  public searchTerm: string = '';
  public showQuickControls: boolean = false;
  public formattedWeddingDate: string = '';
  public readonly localCouplePhoto: string = 'assets/images/couple-photo.jpg';
  public readonly fallbackCouplePhoto: string = 'assets/images/couple-photo-fallback.svg';
  public displayCouplePhoto: string = this.localCouplePhoto;
  public hasTriedApiCouplePhoto: boolean = false;
  public coupleSignature: string = '';
  public selectedSortId: string = 'name-asc';
  public selectedCategory: GiftCategory | null = null;
  public minTotal: string = '';
  public maxTotal: string = '';
  public onlyAvailable: boolean = false;
  public selectedGift: Gift = EMPTY_GIFT;
  public selectedResumePayment: PendingPayment | null = null;
  public showGiftDetailsModal: boolean = false;
  public filterSheetOpen: boolean = false;
  public showGuestConfirmation: boolean = true;

  public readonly carouselIndex: WritableSignal<number> = signal(0);
  public readonly carouselReady: WritableSignal<boolean> = signal(false);
  private carouselInterval: number = 0;
  private touchStartX: number = 0;

  @ViewChild('carouselTrack') public carouselTrack?: ElementRef<HTMLDivElement>;
  @ViewChild('rsvpLauncher') public rsvpLauncher?: ElementRef<HTMLButtonElement>;

  private loopCenteringSettled: boolean = false;
  private wrapPending: boolean = false;
  private focusRsvpLauncherPending: boolean = false;
  private readonly guestConfirmationDismissedStorageKey: string = 'guest-confirmation-dismissed';

  private readonly defaultCaptions: Array<{ tag: string; title: string }> = [
    { tag: 'Momentos', title: 'Memórias que ficam para sempre' },
    { tag: 'Histórias', title: 'Nossa jornada juntos' },
    { tag: 'Amor', title: 'Uma vida ao seu lado' },
    { tag: 'Celebração', title: 'Compartilhando alegrias' },
    { tag: 'Cumplicidade', title: 'Dois corações, uma história' },
    { tag: 'Conquistas', title: 'Cada passo que demos juntos' },
    { tag: 'Futuro', title: 'O melhor ainda está por vir' },
    { tag: 'Gratidão', title: 'Por cada pessoa especial' },
  ];

  public getPhotoCaption(photo: CarouselPhoto, loopIndex: number): { tag: string; title: string } {
    const photoIndex = loopIndex % Math.max(this.carouselPhotos.length, 1);
    const fallback = this.defaultCaptions[photoIndex % this.defaultCaptions.length];
    return {
      tag: photo.tag || fallback.tag,
      title: photo.title || fallback.title,
    };
  }

  public get loopedPhotos(): CarouselPhoto[] {
    const photos = this.carouselPhotos;
    if (photos.length === 0) return [];
    return [...photos, ...photos, ...photos];
  }

  public scrollCarousel(direction: 1 | -1): void {
    const el = this.carouselTrack?.nativeElement;
    if (!el) return;
    const step = this.cardStep(el);
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  }

  private cardStep(el: HTMLDivElement): number {
    const cards = el.querySelectorAll('.carousel-card');

    if (cards.length < 2) {
      return (cards[0] as HTMLElement)?.offsetWidth ?? 0;
    }

    const first = cards[0] as HTMLElement;
    const second = cards[1] as HTMLElement;

    return second.offsetLeft - first.offsetLeft;
  }
  
  public onCarouselScroll(_event: Event): void {
    const el = this.carouselTrack?.nativeElement;
    if (!el || this.carouselPhotos.length === 0) return;

    const step = this.cardStep(el);
    const blockWidth = step * this.carouselPhotos.length;
    const left = el.scrollLeft;

    if (this.wrapPending) return;

    if (left < blockWidth * 0.5) {
      this.wrapPending = true;
      el.scrollTo({ left: left + blockWidth, behavior: 'instant' as ScrollBehavior });
      requestAnimationFrame(() => { this.wrapPending = false; });
      return;
    }

    if (left > blockWidth * 1.9) {
      this.wrapPending = true;
      el.scrollTo({ left: left - blockWidth, behavior: 'instant' as ScrollBehavior });
      requestAnimationFrame(() => { this.wrapPending = false; });
    }
  }

  private centerLoop(): void {
    const el = this.carouselTrack?.nativeElement;
    if (!el || this.carouselPhotos.length === 0) return;

    const step = this.cardStep(el);
    if (step === 0) return;

    el.scrollTo({ left: step * this.carouselPhotos.length, behavior: 'instant' as ScrollBehavior });
    this.loopCenteringSettled = true;
    this.carouselReady.set(true);
  }

  public ngAfterViewChecked(): void {
    if (this.focusRsvpLauncherPending && this.rsvpLauncher) {
      this.rsvpLauncher.nativeElement.focus();
      this.focusRsvpLauncherPending = false;
    }

    if (this.loopCenteringSettled || this.carouselPhotos.length <= 1)
      return;

    const el = this.carouselTrack?.nativeElement;
    if (el && this.cardStep(el) > 0)
      this.centerLoop();
  }

  public readonly skeletonItems: number[] = [1, 2, 3, 4, 5, 6];
  public readonly sortOptions: typeof SORT_OPTIONS = SORT_OPTIONS;
  public readonly categoryOptions: GiftCategory[] = [
    GiftCategory.Kitchen,
    GiftCategory.Appliances,
    GiftCategory.Bedroom,
    GiftCategory.Table,
    GiftCategory.Home,
  ];
  public previewMode: boolean = false;

  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();
  private initialPage: number = 1;
  private sharedGiftId: string = '';

  public constructor(public readonly giftService: GiftService, public readonly coupleService: CoupleService, public readonly paymentResumeService: PaymentResumeService, public readonly route: ActivatedRoute, public readonly router: Router, public readonly toast: ToastService, public readonly coupleDraft: CoupleDraftService) {
    this.showGuestConfirmation = localStorage.getItem(this.guestConfirmationDismissedStorageKey) !== 'true';

    effect((): void => {
      const stateCouple: Couple = this.coupleService.state().couple;
      const nextSignature: string = `${stateCouple.names}|${stateCouple.weddingDate}|${stateCouple.photoUrl}|${stateCouple.message}|${stateCouple.eventLocation}|${stateCouple.primaryColor}|${stateCouple.secondaryColor}|${stateCouple.giftDisplayMode}`;

      if (this.coupleSignature === nextSignature)
        return;

      this.coupleSignature = nextSignature;
      this.formattedWeddingDate = DateUtil.formatWeddingDate(stateCouple.weddingDate);
      this.hasTriedApiCouplePhoto = false;
      this.displayCouplePhoto = this.localCouplePhoto;
      this.carouselIndex.set(0);
      this.startCarousel(); 
    }, { allowSignalWrites: true });

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe((): void => this.loadGifts());
  }

  public get totalGifts(): number {
    return this.giftService.guestState().overallTotal;
  }

  public get contributorsCount(): number {
    return this.giftService.guestState().overallContributors;
  }

  public get totalRaised(): number {
    return this.giftService.guestState().overallRaised;
  }

  public get totalGoal(): number {
    return this.giftService.guestState().overallGoal;
  }

  public get progressPercentage(): number {
    return this.totalGoal > 0 ? (this.totalRaised / this.totalGoal) * 100 : 0;
  }

  public get giftDisplayMode(): GiftDisplayMode {
    return this.coupleService.state().couple.giftDisplayMode || GiftDisplayMode.Traditional;
  }

  public get showGuestStats(): boolean {
    return this.giftDisplayMode !== GiftDisplayMode.PrivateUnlimited && this.siteSettings.showGuestStats;
  }

  public get siteSettings(): CoupleSiteSettings {
    return this.coupleService.state().couple.siteSettings ?? DEFAULT_SITE_SETTINGS;
  }

  public get visibleCategoryOptions(): GiftCategory[] {
    if (!this.siteSettings.showGiftCategories)
      return [];

    return this.categoryOptions.filter((category: GiftCategory): boolean => this.siteSettings.enabledCategories.includes(category));
  }

  public get showCategoryControls(): boolean {
    return this.siteSettings.showGiftCategories && this.siteSettings.showCategoryFilter && this.visibleCategoryOptions.length > 0;
  }

  public get visibleGuestGifts(): Gift[] {
    const gifts: Gift[] = this.giftService.guestState().gifts;

    if (!this.siteSettings.showGiftCategories)
      return gifts;

    return gifts.filter((gift: Gift): boolean => !gift.category || this.siteSettings.enabledCategories.includes(gift.category));
  }

  public get pendingPayment(): PendingPayment | null {
    return this.paymentResumeService.state().pending;
  }

  public get pendingStatusLabel(): string {
    const pendingPayment: PendingPayment | null = this.pendingPayment;

    if (!pendingPayment)
      return '';

    return PaymentStatusUtil.label(pendingPayment.status);
  }

  public get isInitialLoading(): boolean {
    return (this.giftService.guestState().loading && this.giftService.guestState().gifts.length === 0) || this.coupleService.state().loading;
  }

  public get currentPage(): number {
    return this.giftService.guestState().currentPage;
  }

  public get totalPages(): number {
    return this.giftService.guestState().totalPages;
  }

  public get hasActiveFilters(): boolean {
    return this.searchTerm.trim().length > 0 || this.selectedSortId !== 'name-asc' || this.selectedCategory !== null || this.minTotal.trim().length > 0 || this.maxTotal.trim().length > 0 || this.onlyAvailable;
  }

  public ngOnInit(): void {
    this.restoreFiltersFromUrl();
    this.loadCoupleOrPreview();
    this.loadGifts(this.initialPage);
    this.giftService.loadGuestStats();
    this.openSharedGift();
  }

  public ngOnDestroy(): void {
    this.stopCarousel();
    document.body.classList.remove('modal-open');
    this.destroy$.next();
    this.destroy$.complete();
  }

  public get carouselPhotos(): CarouselPhoto[] {
    return this.coupleService.state().couple.carouselPhotos ?? [];
  }

  public startCarousel(): void {
    if (this.carouselPhotos.length <= 1) {
      this.carouselReady.set(true);
      return;
    }
    if (!this.loopCenteringSettled)
      this.carouselReady.set(false);
    this.stopCarousel();
    this.carouselInterval = window.setInterval((): void => {
      if (document.hidden)
        return;

      this.scrollCarousel(1);
    }, 4500);
  }

  public stopCarousel(): void {
    if (this.carouselInterval === 0)
      return;

    clearInterval(this.carouselInterval);
    this.carouselInterval = 0;
  }

  public goToSlide(index: number): void {
    this.carouselIndex.set(index);
    this.startCarousel();
  }

  public prevSlide(): void {
    this.scrollCarousel(-1);
  }

  public nextSlide(): void {
    this.scrollCarousel(1);
  }

  public loadCouple(): void {
    this.coupleService.loadCouple();
  }

  public loadCoupleOrPreview(): void {
    this.previewMode = this.route.snapshot.queryParamMap.get('preview') === '1';
    const draft: Couple | null = this.previewMode ? this.coupleDraft.load() : null;

    if (!draft) {
      this.loadCouple();
      return;
    }

    this.coupleService.patchState({ couple: draft, loading: false, error: '' });
    this.coupleService.theme.apply(draft.primaryColor, draft.secondaryColor);
  }

  public loadGifts(page: number = 1): void {
    this.syncUrl(page);
    this.giftService.loadGuestGifts({
      search: this.searchTerm || undefined,
      category: this.showCategoryControls ? this.selectedCategory || undefined : undefined,
      minTotal: this.siteSettings.showPriceFilter ? this.parsedMoney(this.minTotal) : undefined,
      maxTotal: this.siteSettings.showPriceFilter ? this.parsedMoney(this.maxTotal) : undefined,
      orderBy: this.selectedSort.orderBy,
      orderDir: this.selectedSort.orderDir,
      onlyAvailable: this.siteSettings.showAvailabilityFilter ? this.onlyAvailable || undefined : undefined,
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

  public onCouplePhotoError(): void {
    const apiPhoto = this.coupleService.state().couple.photoUrl?.trim();

    if (!this.hasTriedApiCouplePhoto && apiPhoto && apiPhoto !== this.displayCouplePhoto) {
      this.hasTriedApiCouplePhoto = true;
      this.displayCouplePhoto = apiPhoto;
      return;
    }

    this.displayCouplePhoto = this.fallbackCouplePhoto;
  }

  public onGiftPaymentCompleted(): void {
    this.giftService.refreshGuestGiftsSilently({
      search: this.searchTerm || undefined,
      category: this.showCategoryControls ? this.selectedCategory || undefined : undefined,
      minTotal: this.siteSettings.showPriceFilter ? this.parsedMoney(this.minTotal) : undefined,
      maxTotal: this.siteSettings.showPriceFilter ? this.parsedMoney(this.maxTotal) : undefined,
      orderBy: this.selectedSort.orderBy,
      orderDir: this.selectedSort.orderDir,
      onlyAvailable: this.siteSettings.showAvailabilityFilter ? this.onlyAvailable || undefined : undefined,
      page: this.currentPage,
      pageSize: 20,
    });
    this.giftService.loadGuestStats();
  }

  public trackByGiftId(_: number, gift: Gift): string {
    return gift.id;
  }

  public openGiftDetails(gift: Gift): void {
    this.selectedResumePayment = null;
    this.selectedGift = gift;
    this.sharedGiftId = gift.id;
    this.showGiftDetailsModal = true;
    this.syncUrl(this.currentPage);
  }

  public openGiftDetailsFromKeyboard(event: KeyboardEvent, gift: Gift): void {
    if (event.key !== 'Enter' && event.key !== ' ')
      return;

    event.preventDefault();
    this.openGiftDetails(gift);
  }

  public resumePendingPayment(): void {
    const pendingPayment: PendingPayment | null = this.pendingPayment;

    if (!pendingPayment)
      return;

    this.selectedGift = pendingPayment.gift;
    this.sharedGiftId = pendingPayment.gift.id;
    this.selectedResumePayment = pendingPayment;
    this.showGiftDetailsModal = true;
    this.syncUrl(this.currentPage);
  }

  public dismissPendingPayment(): void {
    const pendingPayment: PendingPayment | null = this.pendingPayment;

    if (!pendingPayment)
      return;

    this.paymentResumeService.clear(pendingPayment.orderId);
  }

  public closeGiftDetails(): void {
    this.showGiftDetailsModal = false;
    this.selectedGift = EMPTY_GIFT;
    this.selectedResumePayment = null;
    this.sharedGiftId = '';
    this.syncUrl(this.currentPage);
  }

  public openGuestConfirmation(): void {
    localStorage.removeItem(this.guestConfirmationDismissedStorageKey);
    this.showGuestConfirmation = true;
  }

  public closeGuestConfirmation(): void {
    localStorage.setItem(this.guestConfirmationDismissedStorageKey, 'true');
    this.showGuestConfirmation = false;
    this.focusRsvpLauncherPending = true;
  }

  public async shareGift(gift: Gift): Promise<void> {
    const url: string = this.giftUrl(gift.id);

    if (navigator.share) {
      try {
        await navigator.share({ title: gift.name, text: `Veja este presente para ${this.coupleService.state().couple.names}.`, url });
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError')
          return;

        this.toast.error('Não foi possível compartilhar este presente.');
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      this.toast.success('Link do presente copiado.');
    } catch {
      this.toast.error('Não foi possível copiar o link do presente.');
    }
  }

  public get selectedSort(): SortOption {
    return this.sortOptions.find((option: SortOption): boolean => option.id === this.selectedSortId) ?? this.sortOptions[0];
  }

  public trackByOptionId(_: number, option: SortOption): string {
    return option.id;
  }

  public trackByNumber(_: number, value: number): number {
    return value;
  }

  public trackByCategory(_: number, category: GiftCategory): GiftCategory {
    return category;
  }

  public onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
  }

  public onTouchEnd(event: TouchEvent): void {
    const delta = event.changedTouches[0].clientX - this.touchStartX;
    if (Math.abs(delta) < 50) return;
    if (delta < 0) this.nextSlide();
    else this.prevSlide();
  }

  @HostListener('window:resize')
  public onResize(): void {
    if (window.innerWidth >= 768 && this.filterSheetOpen) {
      this.closeFilterSheet();
    }
  }

  @HostListener('document:keydown.escape')
  public onEscapePressed(): void {
    if (!this.filterSheetOpen)
      return;

    this.closeFilterSheet();
  }

  public openFilterSheet(): void {
    this.filterSheetOpen = true;
    document.body.classList.add('modal-open');
  }

  public closeFilterSheet(): void {
    this.filterSheetOpen = false;
    document.body.classList.remove('modal-open');
  }

  public applyFilterSheet(): void {
    this.closeFilterSheet();
    this.loadGifts(1);
  }

  public resetFilters(): void {
    this.searchTerm = '';
    this.selectedSortId = 'name-asc';
    this.selectedCategory = null;
    this.minTotal = '';
    this.maxTotal = '';
    this.onlyAvailable = false;
    this.closeFilterSheet();
    this.loadGifts(1);
  }

  public selectCategory(category: GiftCategory | null): void {
    if (category && !this.visibleCategoryOptions.includes(category))
      return;

    this.selectedCategory = category;
    this.onFilterChange();
  }

  private parsedMoney(value: string): number | undefined {
    const normalizedValue: string = value.replace(',', '.').trim();

    if (!normalizedValue)
      return undefined;

    const parsedValue: number = Number(normalizedValue);

    if (Number.isNaN(parsedValue) || parsedValue < 0)
      return undefined;

    return parsedValue;
  }

  private restoreFiltersFromUrl(): void {
    const params = this.route.snapshot.queryParamMap;
    const sortId: string = params.get('sort') ?? '';
    const category: string = params.get('category') ?? '';
    const page: number = Number(params.get('page') ?? '1');

    this.searchTerm = params.get('search') ?? '';
    this.selectedSortId = this.sortOptions.some((option: SortOption): boolean => option.id === sortId) ? sortId : 'name-asc';
    this.selectedCategory = Object.values(GiftCategory).includes(category as GiftCategory) ? category as GiftCategory : null;
    this.minTotal = params.get('min') ?? '';
    this.maxTotal = params.get('max') ?? '';
    this.onlyAvailable = params.get('available') === 'true';
    this.initialPage = Number.isInteger(page) && page > 0 ? page : 1;
    this.sharedGiftId = params.get('gift') ?? '';
  }

  private openSharedGift(): void {
    if (!this.sharedGiftId)
      return;

    this.giftService.loadGuestGiftById(
      this.sharedGiftId,
      (gift: Gift): void => this.openGiftDetails(gift),
      (message: string): void => {
        this.sharedGiftId = '';
        this.syncUrl(this.initialPage);
        this.toast.error(message);
      },
    );
  }

  private syncUrl(page: number): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchTerm.trim() || undefined,
        sort: this.selectedSortId !== 'name-asc' ? this.selectedSortId : undefined,
        category: this.selectedCategory ?? undefined,
        min: this.minTotal.trim() || undefined,
        max: this.maxTotal.trim() || undefined,
        available: this.onlyAvailable || undefined,
        page: page > 1 ? page : undefined,
        gift: this.sharedGiftId || undefined,
        preview: this.previewMode || undefined,
      },
      replaceUrl: true,
    });
  }

  private giftUrl(giftId: string): string {
    const url = new URL('/gifts', window.location.origin);
    url.searchParams.set('gift', giftId);
    return url.toString();
  }
}
