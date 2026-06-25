import { Gift } from '../models/gift.model';

export const EMPTY_GIFT: Gift = {
  id: '',
  image: '',
  name: '',
  price: 0,
  raised: 0,
  total: 0,
  fullyFunded: false,
  description: '',
  available: true,
  allowPartialContribution: true,
};
