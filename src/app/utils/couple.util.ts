import { CarouselPhoto, Couple } from '../models/couple.model';

export abstract class CoupleUtil {
  public static normalize(raw: unknown): Couple {
    const data: Record<string, unknown> = CoupleUtil.record(raw);

    return {
      names: CoupleUtil.text(data['names']),
      weddingDate: CoupleUtil.text(data['weddingDate']),
      photoUrl: CoupleUtil.text(data['photoUrl'] ?? data['photo']),
      message: CoupleUtil.text(data['message']),
      primaryColor: CoupleUtil.text(data['primaryColor']) || '#000000',
      secondaryColor: CoupleUtil.text(data['secondaryColor']) || '#d9d9d9',
      carouselPhotos: CoupleUtil.normalizeCarouselPhotos(data['carouselPhotos'] ?? data['CarouselPhotos']),
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
}
