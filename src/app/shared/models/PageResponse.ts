export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  page: number;
  first: boolean;
  last: boolean;
}
