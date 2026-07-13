import { GiftCategory } from '../enums/gift-category.enum';

export interface GiftCategoryBatchUpdate {
  giftIds: string[];
  category: GiftCategory | null;
}
