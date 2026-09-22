import { inject, Service } from '@angular/core';
import { BookSearchRequest } from '../models/BookFilters';
import { map, Observable } from 'rxjs';
import { Book } from '../models/Book';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PageResponse } from '../../../shared/models/PageResponse';
import { environment } from '../../../../environments/environment';

@Service()
export class BookService {
  private readonly http = inject(HttpClient);

  private readonly booksUrl = `${environment.apiUrl}/books`;

  getFilteredBooks(bookSearchRequest: BookSearchRequest): Observable<PageResponse<Book>> {
    let params = new HttpParams().set('query', bookSearchRequest.filters.query);

    if (bookSearchRequest.filters.category)
      params = params.set('category', bookSearchRequest.filters.category);

    if (bookSearchRequest.filters.minPrice !== null)
      params = params.set('minPrice', bookSearchRequest.filters.minPrice);

    if (bookSearchRequest.filters.maxPrice !== null)
      params = params.set('maxPrice', bookSearchRequest.filters.maxPrice);

    params = params
      .set('availableOnly', bookSearchRequest.filters.availableOnly)
      .set('page', bookSearchRequest.pageRequest.page)
      .set('size', bookSearchRequest.pageRequest.size)
      .set(
        'sort',
        `${bookSearchRequest.pageRequest.sort},${bookSearchRequest.pageRequest.direction}`,
      );

    return this.http.get<PageResponse<Book>>(`${this.booksUrl}`, { params: params });
  }
}
