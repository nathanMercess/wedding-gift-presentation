import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, WritableSignal, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { SORT_OPTIONS } from '../../constants/sort-options.constant';
import { SortDirection } from '../../enums/SortDirection';
import { CarouselPhoto, Couple } from '../../models/couple.model';
import { Gift } from '../../models/gift.model';
import { CoupleService } from '../../services/couple.service';
import { GiftService } from '../../services/gift.service';
import { DateUtil } from '../../utils/date.util';
import { CountdownComponent } from '../countdown/countdown.component';
import { GiftCardComponent } from '../gift-card/gift-card.component';
import { GiftDetailsModalComponent } from '../gift-details-modal/gift-details-modal.component';

@Component({
  standalone: true,
  selector: 'app-guest-view',
  templateUrl: './guest-view.component.html',
  styleUrl: './guest-view.component.scss',
  imports: [CommonModule, FormsModule, GiftCardComponent, GiftDetailsModalComponent, CountdownComponent],
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
  public sortDirection: SortDirection = SortDirection.Asc;
  public onlyAvailable: boolean = false;
  public selectedGift: Gift | null = null;
  public filterSheetOpen: boolean = false;

  public readonly carouselIndex: WritableSignal<number> = signal(0);
  public readonly carouselReady: WritableSignal<boolean> = signal(false);
  private carouselInterval: ReturnType<typeof setInterval> | null = null;
  private touchStartX: number = 0;

  @ViewChild('carouselTrack') public carouselTrack?: ElementRef<HTMLDivElement>;

  private loopCenteringSettled: boolean = false;
  private wrapPending: boolean = false;

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
    if (this.loopCenteringSettled || this.carouselPhotos.length <= 1)
      return;

    const el = this.carouselTrack?.nativeElement;
    if (el && this.cardStep(el) > 0)
      this.centerLoop();
  }

  public readonly skeletonItems: number[] = [1, 2, 3, 4, 5, 6];
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

  public get completedGifts(): number {
    return this.giftService.guestState().overallCompleted;
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

  public get isInitialLoading(): boolean {
    return (this.giftService.guestState().loading && this.giftService.guestState().gifts.length === 0) || this.coupleService.state().loading;
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
    this.giftService.loadGuestStats();
  }

  public ngOnDestroy(): void {
    this.stopCarousel();
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
    this.carouselInterval = setInterval((): void => {
      if (document.hidden)
        return;

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
    // Uso del nuevo método tipado
    this.giftService.loadGuestGifts({
      search: this.searchTerm || undefined,
      orderDir: this.sortDirection,
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
    // Uso del nuevo método tipado
    this.giftService.refreshGuestGiftsSilently({
      search: this.searchTerm || undefined,
      orderDir: this.sortDirection,
      onlyAvailable: this.onlyAvailable || undefined,
      page: this.currentPage,
      pageSize: 20,
    });
    this.giftService.loadGuestStats();
  }

  public trackByGiftId(_: number, gift: Gift): string {
    return gift.id;
  }

  public trackByOptionId(_: number, option: { id: SortDirection }): SortDirection {
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

  @HostListener('window:resize')
  public onResize(): void {
    if (window.innerWidth >= 768 && this.filterSheetOpen) {
      this.closeFilterSheet();
    }
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
    this.sortDirection = SortDirection.Asc;
    this.onlyAvailable = false;
    this.closeFilterSheet();
    this.loadGifts(1);
  }
}
