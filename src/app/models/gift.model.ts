import { GiftCategory } from '../enums/gift-category.enum';

export interface Gift {
  id: string;
  image: string;
  name: string;
  price: number;
  raised: number;
  total: number;
  remaining?: number;
  fullyFunded: boolean;
  category?: GiftCategory | null;
  description?: string;
  available: boolean;
  allowPartialContribution: boolean;
}
