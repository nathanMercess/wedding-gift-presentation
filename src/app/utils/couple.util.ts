import { CarouselPhoto, Couple } from '../models/couple.model';
import { DEFAULT_SITE_SETTINGS } from '../constants/default-site-settings.constant';
import { GiftCategory } from '../enums/gift-category.enum';
import { GiftDisplayMode } from '../enums/gift-display-mode.enum';

export abstract class CoupleUtil {
  public static normalize(raw: unknown): Couple {
    const data: Record<string, unknown> = CoupleUtil.record(raw);

    return {
      names: CoupleUtil.text(data['names']),
      weddingDate: CoupleUtil.text(data['weddingDate']),
      photoUrl: CoupleUtil.text(data['photoUrl'] ?? data['photo']),
      message: CoupleUtil.text(data['message']),
      eventLocation: CoupleUtil.text(data['eventLocation'] ?? data['EventLocation']),
      primaryColor: CoupleUtil.text(data['primaryColor']) || '#000000',
      secondaryColor: CoupleUtil.text(data['secondaryColor']) || '#d9d9d9',
      giftDisplayMode: CoupleUtil.giftDisplayMode(data['giftDisplayMode'] ?? data['GiftDisplayMode']),
      carouselPhotos: CoupleUtil.normalizeCarouselPhotos(data['carouselPhotos'] ?? data['CarouselPhotos']),
      siteSettings: CoupleUtil.normalizeSiteSettings(data['siteSettings'] ?? data['SiteSettings']),
    };
  }

  public static normalizeCarouselPhotos(raw: unknown): CarouselPhoto[] {
    if (!Array.isArray(raw))
      return [];

    return raw.map((item: unknown): CarouselPhoto => CoupleUtil.normalizeCarouselPhoto(item));
  }

  public static normalizeCarouselPhoto(raw: unknown): CarouselPhoto {
    if (typeof raw === 'string')
      return { url: raw, tag: '', title: '' };

    const data: Record<string, unknown> = CoupleUtil.record(raw);

    return {
      url: CoupleUtil.text(data['url'] ?? data['Url']),
      tag: CoupleUtil.text(data['tag'] ?? data['Tag']),
      title: CoupleUtil.text(data['title'] ?? data['Title']),
    };
  }

  public static record(value: unknown): Record<string, unknown> {
    if (typeof value === 'object' && value !== null)
      return value as Record<string, unknown>;

    return {};
  }

  public static text(value: unknown): string {
    if (typeof value === 'string')
      return value;

    return '';
  }

  public static giftDisplayMode(value: unknown): GiftDisplayMode {
    if (value === GiftDisplayMode.PrivateUnlimited)
      return GiftDisplayMode.PrivateUnlimited;

    return GiftDisplayMode.Traditional;
  }

  public static normalizeSiteSettings(raw: unknown): typeof DEFAULT_SITE_SETTINGS {
    const data: Record<string, unknown> = CoupleUtil.record(raw);

    return {
      ...DEFAULT_SITE_SETTINGS,
      showCountdown: CoupleUtil.boolean(data['showCountdown'] ?? data['ShowCountdown'], DEFAULT_SITE_SETTINGS.showCountdown),
      showEventLocation: CoupleUtil.boolean(data['showEventLocation'] ?? data['ShowEventLocation'], DEFAULT_SITE_SETTINGS.showEventLocation),
      showCoupleMessage: CoupleUtil.boolean(data['showCoupleMessage'] ?? data['ShowCoupleMessage'], DEFAULT_SITE_SETTINGS.showCoupleMessage),
      showGuestStats: CoupleUtil.boolean(data['showGuestStats'] ?? data['ShowGuestStats'], DEFAULT_SITE_SETTINGS.showGuestStats),
      showGiftCategories: CoupleUtil.boolean(data['showGiftCategories'] ?? data['ShowGiftCategories'], DEFAULT_SITE_SETTINGS.showGiftCategories),
      showGiftProgress: CoupleUtil.boolean(data['showGiftProgress'] ?? data['ShowGiftProgress'], DEFAULT_SITE_SETTINGS.showGiftProgress),
      showContributionType: CoupleUtil.boolean(data['showContributionType'] ?? data['ShowContributionType'], DEFAULT_SITE_SETTINGS.showContributionType),
      showCategoryFilter: CoupleUtil.boolean(data['showCategoryFilter'] ?? data['ShowCategoryFilter'], DEFAULT_SITE_SETTINGS.showCategoryFilter),
      showPriceFilter: CoupleUtil.boolean(data['showPriceFilter'] ?? data['ShowPriceFilter'], DEFAULT_SITE_SETTINGS.showPriceFilter),
      showAvailabilityFilter: CoupleUtil.boolean(data['showAvailabilityFilter'] ?? data['ShowAvailabilityFilter'], DEFAULT_SITE_SETTINGS.showAvailabilityFilter),
      enabledCategories: CoupleUtil.giftCategories(data['enabledCategories'] ?? data['EnabledCategories']),
      giftSectionTitle: CoupleUtil.text(data['giftSectionTitle'] ?? data['GiftSectionTitle']) || DEFAULT_SITE_SETTINGS.giftSectionTitle,
      giftSectionSubtitle: CoupleUtil.text(data['giftSectionSubtitle'] ?? data['GiftSectionSubtitle']),
      searchPlaceholder: CoupleUtil.text(data['searchPlaceholder'] ?? data['SearchPlaceholder']) || DEFAULT_SITE_SETTINGS.searchPlaceholder,
      presentButtonLabel: CoupleUtil.text(data['presentButtonLabel'] ?? data['PresentButtonLabel']) || DEFAULT_SITE_SETTINGS.presentButtonLabel,
      emptyStateTitle: CoupleUtil.text(data['emptyStateTitle'] ?? data['EmptyStateTitle']) || DEFAULT_SITE_SETTINGS.emptyStateTitle,
      emptyStateMessage: CoupleUtil.text(data['emptyStateMessage'] ?? data['EmptyStateMessage']) || DEFAULT_SITE_SETTINGS.emptyStateMessage,
    };
  }

  public static boolean(value: unknown, fallback: boolean): boolean {
    if (typeof value === 'boolean')
      return value;

    return fallback;
  }

  public static giftCategories(value: unknown): GiftCategory[] {
    if (!Array.isArray(value))
      return [...DEFAULT_SITE_SETTINGS.enabledCategories];

    return value.filter((category: unknown): category is GiftCategory => Object.values(GiftCategory).includes(category as GiftCategory));
  }
}
