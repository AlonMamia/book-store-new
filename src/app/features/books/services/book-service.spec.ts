import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BookService } from './book-service';
import { BookSearchRequest } from '../models/BookFilters';
import { Book } from '../models/Book';
import { PageResponse } from '../../../shared/models/PageResponse';
import { environment } from '../../../../environments/environment';

describe('BookService', () => {
  let service: BookService;
  let httpMock: HttpTestingController;

  const booksUrl = `${environment.apiUrl}/books`;
  const matchBooksRequest = (request: { url: string }) => request.url === booksUrl;

  const baseRequest: BookSearchRequest = {
    filters: {
      query: '',
      category: null,
      minPrice: null,
      maxPrice: null,
      availableOnly: false,
    },
    pageRequest: {
      page: 0,
      size: 10,
      sort: 'title',
      direction: 'asc',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(BookService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('sends a GET request to the books endpoint with page, size and sort', () => {
    service.getFilteredBooks(baseRequest).subscribe();

    const req = httpMock.expectOne(matchBooksRequest, 'books request');

    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    expect(req.request.params.get('sort')).toBe('title,asc');
    expect(req.request.params.get('query')).toBe('');

    req.flush({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    });
  });

  it('omits optional filter params when they are null/absent', () => {
    service.getFilteredBooks(baseRequest).subscribe();

    const req = httpMock.expectOne(matchBooksRequest);

    expect(req.request.params.has('category')).toBe(false);
    expect(req.request.params.has('minPrice')).toBe(false);
    expect(req.request.params.has('maxPrice')).toBe(false);
    expect(req.request.params.get('availableOnly')).toBe('false');

    req.flush({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    });
  });

  it('includes category, minPrice and maxPrice when provided', () => {
    const request: BookSearchRequest = {
      filters: {
        query: 'dune',
        category: 'SCIENCE_FICTION',
        minPrice: 10,
        maxPrice: 50,
        availableOnly: true,
      },
      pageRequest: {
        page: 2,
        size: 20,
        sort: 'price',
        direction: 'desc',
      },
    };

    service.getFilteredBooks(request).subscribe();

    const req = httpMock.expectOne(matchBooksRequest);

    expect(req.request.params.get('query')).toBe('dune');
    expect(req.request.params.get('category')).toBe('SCIENCE_FICTION');
    expect(req.request.params.get('minPrice')).toBe('10');
    expect(req.request.params.get('maxPrice')).toBe('50');
    expect(req.request.params.get('availableOnly')).toBe('true');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('20');
    expect(req.request.params.get('sort')).toBe('price,desc');

    req.flush({
      content: [],
      page: 2,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      first: false,
      last: true,
    });
  });

  it('sends the zero-based page number as received, without translation', () => {
    const request: BookSearchRequest = {
      ...baseRequest,
      pageRequest: { ...baseRequest.pageRequest, page: 3 },
    };

    service.getFilteredBooks(request).subscribe();

    const req = httpMock.expectOne(matchBooksRequest);
    expect(req.request.params.get('page')).toBe('3');

    req.flush({
      content: [],
      page: 3,
      size: 10,
      totalElements: 0,
      totalPages: 4,
      first: false,
      last: true,
    });
  });

  it('returns the typed PageResponse<Book> parsed from the server response', () => {
    const book: Book = {
      id: 1,
      title: 'Dune',
      description: 'A desert planet saga',
      isbn: '123',
      author: 'Frank Herbert',
      category: 'SCIENCE_FICTION',
      price: 29.9,
      stockQuantity: 5,
    };

    const mockResponse: PageResponse<Book> = {
      content: [book],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    };

    let actual: PageResponse<Book> | undefined;

    service.getFilteredBooks(baseRequest).subscribe((response) => {
      actual = response;
    });

    httpMock.expectOne(matchBooksRequest).flush(mockResponse);

    expect(actual).toEqual(mockResponse);
  });

  it('propagates HTTP errors to the subscriber', () => {
    let errorStatus: number | undefined;
    let nextCalled = false;

    service.getFilteredBooks(baseRequest).subscribe({
      next: () => {
        nextCalled = true;
      },
      error: (err) => {
        errorStatus = err.status;
      },
    });

    httpMock
      .expectOne(matchBooksRequest)
      .flush('Internal error', { status: 500, statusText: 'Internal Server Error' });

    expect(nextCalled).toBe(false);
    expect(errorStatus).toBe(500);
  });
});
