import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GiftCardComponent } from '../gift-card/gift-card.component';
import { GiftDetailsModalComponent } from '../gift-details-modal/gift-details-modal.component';
import { Gift } from '../../models/gift.model';
import { Couple } from '../../models/couple.model';
import { GiftService } from '../../services/gift.service';
import { CoupleService } from '../../services/couple.service';

@Component({
  selector: 'app-guest-view',
  standalone: true,
  imports: [CommonModule, FormsModule, GiftCardComponent, GiftDetailsModalComponent],
  templateUrl: './guest-view.component.html',
  styleUrl: './guest-view.component.scss'
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
  public filteredGiftsCache: Gift[] = [];
  public filteredGiftsCacheKey: string = '';
  public filteredGiftsCacheSource: Gift[] | null = null;
  public coupleSignature: string = '';
  public sortBy: string = 'name';
  public selectedGift: Gift | null = null;

  public skeletonItems: number[] = [1, 2, 3, 4, 5, 6];

  public quickCategories: Array<{ id: string; label: string }> = [
    { id: 'todos', label: 'Todos' },
    { id: 'Cozinha', label: 'Cozinha' },
    { id: 'Casa', label: 'Casa' },
    { id: 'Eletrodomésticos', label: 'Eletrodomésticos' },
    { id: 'Mesa', label: 'Mesa' },
    { id: 'Quarto', label: 'Quarto' },
  ];

  public constructor(public readonly giftService: GiftService, public readonly coupleService: CoupleService) {
    effect((): void => {
      const stateCouple: Couple = this.coupleService.state().couple;
      const nextSignature: string = `${stateCouple.names}|${stateCouple.weddingDate}|${stateCouple.photo}|${stateCouple.message}`;

      if (this.coupleSignature === nextSignature) return;

      this.coupleSignature = nextSignature;
      this.formattedWeddingDate = this.formatWeddingDate(stateCouple.weddingDate);
      this.hasTriedApiCouplePhoto = false;
      this.displayCouplePhoto = this.localCouplePhoto;
    });
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

  public formatWeddingDate(rawValue: string): string {
    const value = rawValue?.trim();
    if (!value) return '';

    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return value;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));

    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  }

  public loadGifts(): void {
    this.giftService.loadGuestGifts();
    this.filteredGiftsCacheSource = null;
  }

  public normalizeText(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  public getCategoryKey(category: string): string {
    const normalized = this.normalizeText(category);
    if (normalized === 'eletro' || normalized === 'eletrodomestico' || normalized === 'eletrodomesticos') return 'eletrodomesticos';
    return normalized;
  }

  public sortOptions: Array<{ id: string; label: string }> = [
    { id: 'name', label: 'Nome (A-Z)' },
    { id: 'price-asc', label: 'Menor preço' },
    { id: 'price-desc', label: 'Maior preço' },
  ];

  public get filteredGifts(): Gift[] {
    const allGifts = this.giftService.guestState().gifts;
    const selectedCategoryKey = this.getCategoryKey(this.selectedCategory);
    const normalizedSearch = this.normalizeText(this.searchTerm);
    const cacheKey = `${selectedCategoryKey}|${normalizedSearch}|${this.sortBy}`;

    if (this.filteredGiftsCacheSource === allGifts && this.filteredGiftsCacheKey === cacheKey) {
      return this.filteredGiftsCache;
    }

    this.filteredGiftsCache = allGifts
      .filter(g => {
        const matchCat = selectedCategoryKey === 'todos' || this.getCategoryKey(g.category) === selectedCategoryKey;
        const matchSearch = !normalizedSearch || this.normalizeText(g.name).includes(normalizedSearch);
        return matchCat && matchSearch;
      })
      .sort((a, b) => {
        if (this.sortBy === 'price-asc') return a.price - b.price;
        if (this.sortBy === 'price-desc') return b.price - a.price;
        return a.name.localeCompare(b.name);
      });

    this.filteredGiftsCacheSource = allGifts;
    this.filteredGiftsCacheKey = cacheKey;
    return this.filteredGiftsCache;
  }

  public trackByGiftId(_: number, gift: Gift): number {
    return gift.id;
  }

  public trackByOptionId(_: number, option: { id: string }): string {
    return option.id;
  }

  public trackByNumber(_: number, value: number): number {
    return value;
  }

  public get totalGifts(): number {
    return this.giftService.guestState().gifts.length;
  }

  public get completedGifts(): number {
    return this.giftService.guestState().gifts.filter((g: Gift): boolean => g.raised >= g.total).length;
  }

  public get totalRaised(): number {
    return this.giftService.guestState().gifts.reduce((sum: number, gift: Gift): number => sum + gift.raised, 0);
  }

  public get totalGoal(): number {
    return this.giftService.guestState().gifts.reduce((sum: number, gift: Gift): number => sum + gift.total, 0);
  }

  public get progressPercentage(): number { return this.totalGoal > 0 ? (this.totalRaised / this.totalGoal) * 100 : 0; }
}
