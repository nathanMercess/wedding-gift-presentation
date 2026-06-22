import { GiftSortField } from "../enums/GiftSortField";
import { SortDirection } from "../enums/SortDirection";

export interface SortOption {
  id: string;
  label: string;
  orderBy: GiftSortField;
  orderDir: SortDirection;
}

export const SORT_OPTIONS: SortOption[] = [
  {
    id: 'name',
    label: 'Nome (A-Z)',
    orderBy: GiftSortField.Name,
    orderDir: SortDirection.Asc
  },
  {
    id: 'price-asc',
    label: 'Menor preço',
    orderBy: GiftSortField.Price,
    orderDir: SortDirection.Asc
  },
  {
    id: 'price-desc',
    label: 'Maior preço',
    orderBy: GiftSortField.Price,
    orderDir: SortDirection.Desc
  },
];