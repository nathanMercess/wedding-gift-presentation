import { GiftCategory } from '../enums/gift-category.enum';
import { CoupleSiteSettings } from '../models/couple.model';

export const DEFAULT_SITE_SETTINGS: CoupleSiteSettings = {
  showCountdown: true,
  showEventLocation: true,
  showCoupleMessage: true,
  showGuestStats: true,
  showGiftCategories: true,
  showGiftProgress: true,
  showContributionType: true,
  showCategoryFilter: true,
  showPriceFilter: true,
  showAvailabilityFilter: true,
  enabledCategories: [
    GiftCategory.Kitchen,
    GiftCategory.Appliances,
    GiftCategory.Bedroom,
    GiftCategory.Table,
    GiftCategory.Home,
  ],
  giftSectionTitle: 'Escolha seu presente',
  giftSectionSubtitle: '',
  searchPlaceholder: 'Buscar presente...',
  presentButtonLabel: 'Presentear',
  emptyStateTitle: 'Nenhum presente encontrado',
  emptyStateMessage: 'Tente ajustar os filtros ou buscar por outro termo',
};
