import { GiftCategory } from '../enums/gift-category.enum';
import { GiftDisplayMode } from '../enums/gift-display-mode.enum';

export interface CarouselPhoto {
  url: string;
  tag: string;
  title: string;
}

export interface CoupleSiteSettings {
  showCountdown: boolean;
  showEventLocation: boolean;
  showCoupleMessage: boolean;
  showGuestStats: boolean;
  showGiftCategories: boolean;
  showGiftProgress: boolean;
  showContributionType: boolean;
  showCategoryFilter: boolean;
  showPriceFilter: boolean;
  showAvailabilityFilter: boolean;
  enabledCategories: GiftCategory[];
  giftSectionTitle: string;
  giftSectionSubtitle: string;
  searchPlaceholder: string;
  presentButtonLabel: string;
  emptyStateTitle: string;
  emptyStateMessage: string;
}

export interface Couple {
  names: string;
  weddingDate: string;
  photoUrl: string;
  message: string;
  eventLocation: string;
  primaryColor: string;
  secondaryColor: string;
  giftDisplayMode: GiftDisplayMode;
  carouselPhotos: CarouselPhoto[];
  siteSettings: CoupleSiteSettings;
}
