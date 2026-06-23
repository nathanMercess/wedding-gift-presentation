import { SortDirection } from '../enums/SortDirection';

export interface SortOption {
  id: SortDirection;
  label: string;
  orderDir: SortDirection;
}

export const SORT_OPTIONS: SortOption[] = [
  {
    id: SortDirection.Asc,
    label: 'Menor preço',
    orderDir: SortDirection.Asc,
  },
  {
    id: SortDirection.Desc,
    label: 'Maior preço',
    orderDir: SortDirection.Desc,
  },
];
