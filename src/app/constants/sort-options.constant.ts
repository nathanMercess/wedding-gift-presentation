import { GiftSortField } from '../enums/GiftSortField';
import { SortDirection } from '../enums/SortDirection';

export interface SortOption {
  id: string;
  label: string;
  orderBy: GiftSortField;
  orderDir: SortDirection;
}

export const SORT_OPTIONS: SortOption[] = [
  {
    id: 'name-asc',
    label: 'Nome (A-Z)',
    orderBy: GiftSortField.Name,
    orderDir: SortDirection.Asc,
  },
  {
    id: 'total-asc',
    label: 'Menor preço',
    orderBy: GiftSortField.Total,
    orderDir: SortDirection.Asc,
  },
  {
    id: 'total-desc',
    label: 'Maior preço',
    orderBy: GiftSortField.Total,
    orderDir: SortDirection.Desc,
  },
];
