import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, GiftCardComponent, GiftDetailsModalComponent]
})
export class GuestViewComponent implements OnInit {
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
  public selectedGift: Gift | null = null;

  public readonly skeletonItems: number[] = [1, 2, 3, 4, 5, 6];
  public readonly quickCategories: Array<{ id: string; label: string }> = [
    { id: 'todos', label: 'Todos' },
    ...GIFT_CATEGORIES,
  ];
  public readonly sortOptions: typeof SORT_OPTIONS = SORT_OPTIONS;

  public constructor(public readonly giftService: GiftService, public readonly coupleService: CoupleService) {
    effect((): void => {
      const stateCouple: Couple = this.coupleService.state().couple;

      const nextSignature: string = `${stateCouple.names}|${stateCouple.weddingDate}|${stateCouple.photo}|${stateCouple.message}`;

      if (this.coupleSignature === nextSignature)
        return;

      this.coupleSignature = nextSignature;
      this.formattedWeddingDate = DateUtil.formatWeddingDate(stateCouple.weddingDate);
      this.hasTriedApiCouplePhoto = false;
      this.displayCouplePhoto = this.localCouplePhoto;

      if (stateCouple.primaryColor)
        document.documentElement.style.setProperty('--primary', stateCouple.primaryColor);
    });
  }

  public get filteredGifts(): Gift[] {
    const allGifts = this.giftService.guestState().gifts;
    const selectedCategoryKey = this.getCategoryKey(this.selectedCategory);
    const normalizedSearch = this.normalizeText(this.searchTerm);

    return allGifts
      .filter((gift: Gift): boolean => {
        const matchCat = selectedCategoryKey === 'todos' || this.getCategoryKey(gift.category) === selectedCategoryKey;
        const matchSearch = !normalizedSearch || this.normalizeText(gift.name).includes(normalizedSearch);
        return matchCat && matchSearch;
      })
      .sort((a: Gift, b: Gift): number => {
        if (this.sortBy === 'price-asc')
          return a.price - b.price;

        if (this.sortBy === 'price-desc')
          return b.price - a.price;

        return a.name.localeCompare(b.name);
      });
  }

  public get totalGifts(): number {
    return this.giftService.guestState().gifts.length;
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

  public ngOnInit(): void {
    this.loadCouple();
    this.loadGifts();
  }

  public loadCouple(): void {
    this.coupleService.loadCouple();
  }

  public onCouplePhotoError(): void {
    const apiPhoto = this.coupleService.state().couple.photo?.trim();

    if (!this.hasTriedApiCouplePhoto && apiPhoto && apiPhoto !== this.displayCouplePhoto) {
      this.hasTriedApiCouplePhoto = true;
      this.displayCouplePhoto = apiPhoto;
      return;
    }

    this.displayCouplePhoto = this.fallbackCouplePhoto;
  }

  public loadGifts(): void {
    this.giftService.loadGuestGifts();
  }

  public onGiftPaymentCompleted(): void {
    this.loadGifts();
  }

  public normalizeText(value: string): string {
    return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  }

  public getCategoryKey(category: string): string {
    const normalized = this.normalizeText(category);
    if (normalized === 'eletro' || normalized === 'eletrodomestico' || normalized === 'eletrodomesticos')
      return 'eletrodomesticos';

    return normalized;
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
}
