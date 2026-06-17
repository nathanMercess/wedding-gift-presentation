import { Component, ElementRef, OnDestroy, OnInit, ViewChild, effect, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { GiftCardComponent } from '../gift-card/gift-card.component';
import { GiftDetailsModalComponent } from '../gift-details-modal/gift-details-modal.component';
import { Gift } from '../../models/gift.model';
import { Couple } from '../../models/couple.model';
import { GiftService } from '../../services/gift.service';
import { CoupleService } from '../../services/couple.service';
import { GIFT_CATEGORIES } from '../../constants/gift-categories.constant';
import { SORT_OPTIONS } from '../../constants/sort-options.constant';
import { DateUtil } from '../../utils/date.util';

@Component({
  standalone: true,
  selector: 'app-guest-view',
  templateUrl: './guest-view.component.html',
  styleUrl: './guest-view.component.scss',
  imports: [CommonModule, FormsModule, GiftCardComponent, GiftDetailsModalComponent],
})
export class GuestViewComponent implements OnInit, OnDestroy {
  public searchTerm: string = '';
  public selectedCategory: string = 'todos';
  public showQuickControls: boolean = false;
  public formattedWeddingDate: string = '';
  public readonly localCouplePhoto: string = 'assets/images/couple-photo.jpg';
  public readonly fallbackCouplePhoto: string = 'assets/images/couple-photo-fallback.svg';
  public displayCouplePhoto: string = this.localCouplePhoto;
  public hasTriedApiCouplePhoto: boolean = false;
  public coupleSignature: string = '';
  public sortBy: string = 'name';
  public sortDir: string = 'asc';
  public onlyAvailable: boolean = false;
  public selectedGift: Gift | null = null;
  public filterSheetOpen: boolean = false;

  public readonly carouselIndex: WritableSignal<number> = signal(0);
  private carouselInterval: ReturnType<typeof setInterval> | null = null;
  private touchStartX: number = 0;

  @ViewChild('carouselTrack') public carouselTrack?: ElementRef<HTMLDivElement>;

  private loopCenteringSettled: boolean = false;
  private wrapPending: boolean = false;

  public get loopedPhotos(): string[] {
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
    el.scrollTo({ left: step * this.carouselPhotos.length, behavior: 'instant' as ScrollBehavior });
    this.loopCenteringSettled = true;
  }

  public readonly skeletonItems: number[] = [1, 2, 3, 4, 5, 6];
  
  public readonly photoCaptions: Array<{ tag: string; title: string }> = [
    { tag: 'Momentos', title: 'Memórias especiais' },
    { tag: 'Histórias', title: 'Cada foto conta uma história' },
    { tag: 'Lembranças', title: 'Recordações que permanecem' },
    { tag: 'Experiências', title: 'Momentos que marcaram nossa trajetória' },
    { tag: 'Conquistas', title: 'Passos importantes da jornada' },
    { tag: 'Pessoas', title: 'Quem faz parte dessa história' },
    { tag: 'Inspiração', title: 'Razões para celebrar' },
    { tag: 'Futuro', title: 'O que ainda está por vir' },
  ];

  public readonly quickCategories: Array<{ id: string; label: string }> = [
    { id: 'todos', label: 'Todos' },
    ...GIFT_CATEGORIES,
  ];
  public readonly sortOptions: typeof SORT_OPTIONS = SORT_OPTIONS;

  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  public constructor(public readonly giftService: GiftService, public readonly coupleService: CoupleService) {
    effect((): void => {
      const stateCouple: Couple = this.coupleService.state().couple;
      const nextSignature: string = `${stateCouple.names}|${stateCouple.weddingDate}|${stateCouple.photoUrl}|${stateCouple.message}|${stateCouple.primaryColor}|${stateCouple.secondaryColor}`;

      if (this.coupleSignature === nextSignature)
        return;

      this.coupleSignature = nextSignature;
      this.formattedWeddingDate = DateUtil.formatWeddingDate(stateCouple.weddingDate);
      this.hasTriedApiCouplePhoto = false;
      this.displayCouplePhoto = this.localCouplePhoto;
      this.carouselIndex.set(0);
      this.startCarousel(); // allowSignalWrites required: carouselIndex is a WritableSignal
    }, { allowSignalWrites: true });

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe((): void => this.loadGifts());
  }

  public get totalGifts(): number {
    return this.giftService.guestState().totalCount;
  }

  public get completedGifts(): number {
    return this.giftService.guestState().gifts.filter((g: Gift): boolean => !g.available).length;
  }

  public get totalRaised(): number {
    return this.giftService.guestState().gifts.reduce((sum: number, gift: Gift): number => sum + gift.raised, 0);
  }

  public get totalGoal(): number {
    return this.giftService.guestState().gifts.reduce((sum: number, gift: Gift): number => sum + gift.total, 0);
  }

  public get progressPercentage(): number {
    return this.totalGoal > 0 ? (this.totalRaised / this.totalGoal) * 100 : 0;
  }

  public get currentPage(): number {
    return this.giftService.guestState().currentPage;
  }

  public get totalPages(): number {
    return this.giftService.guestState().totalPages;
  }

  public ngOnInit(): void {
    this.loadCouple();
    this.loadGifts();
  }

  public ngOnDestroy(): void {
    this.stopCarousel();
    this.destroy$.next();
    this.destroy$.complete();
  }

  public get carouselPhotos(): string[] {
    return this.coupleService.state().couple.carouselPhotos ?? [];
  }

  public startCarousel(): void {
    if (this.carouselPhotos.length <= 1) return;
    this.stopCarousel();
    if (!this.loopCenteringSettled) {
      setTimeout(() => this.centerLoop(), 300);
    }
    this.carouselInterval = setInterval((): void => {
      this.scrollCarousel(1);
    }, 4500);
  }

  public stopCarousel(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
    }
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

  public loadGifts(page: number = 1): void {
    const [orderBy, orderDir] = this.parseSortBy();
    this.giftService.loadGuestGifts({
      search: this.searchTerm || undefined,
      category: this.selectedCategory !== 'todos' ? this.selectedCategory : undefined,
      orderBy,
      orderDir,
      onlyAvailable: this.onlyAvailable || undefined,
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
    this.loadGifts(this.currentPage);
  }

  private parseSortBy(): [string, string] {
    if (this.sortBy === 'price-asc') return ['price', 'asc'];
    if (this.sortBy === 'price-desc') return ['price', 'desc'];
    return ['name', 'asc'];
  }

  public trackByGiftId(_: number, gift: Gift): string {
    return gift.id;
  }

  public trackByOptionId(_: number, option: { id: string }): string {
    return option.id;
  }

  public trackByNumber(_: number, value: number): number {
    return value;
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
    this.selectedCategory = 'todos';
    this.sortBy = 'name';
    this.onlyAvailable = false;
    this.closeFilterSheet();
    this.loadGifts(1);
  }
}
