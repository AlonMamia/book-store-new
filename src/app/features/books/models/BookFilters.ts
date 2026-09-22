import { PageRequest } from '../../../shared/models/PageRequest';

export interface BookFilters {
  query: string;
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  availableOnly: boolean;
}

export interface BookSearchRequest{
  filters: BookFilters;
  pageRequest: PageRequest
}
