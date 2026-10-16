export interface PageRequest {
  page: number;
  size: number;
  sort: 'title' | 'author' | 'price';
  direction: 'asc' | 'desc';
}
