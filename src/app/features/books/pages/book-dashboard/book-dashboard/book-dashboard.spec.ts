import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, HttpRequest } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { BookDashboard } from './book-dashboard';
import { UserState } from '../../../../user/services/user-state';
import { User } from '../../../../user/models/User';
import { PageResponse } from '../../../../../shared/models/PageResponse';
import { Book } from '../../../models/Book';
import { environment } from '../../../../../../environments/environment';

describe('BookDashboard', () => {
  let component: BookDashboard;
  let fixture: ComponentFixture<BookDashboard>;
  let httpMock: HttpTestingController;
  let userState: UserState;

  const booksUrl = `${environment.apiUrl}/books`;
  const matchBooksRequest = (request: HttpRequest<unknown>) => request.url === booksUrl;

  const authenticatedUser: User = {
    email: 'reader@example.com',
    role: 'USER',
    firstName: 'Ada',
    lastName: 'Lovelace',
    dateOfBirth: new Date('1990-01-01'),
  };

  function emptyPage(overrides: Partial<PageResponse<Book>> = {}): PageResponse<Book> {
    return {
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      ...overrides,
    };
  }

  function makeBook(id: number): Book {
    return {
      id,
      title: `Book ${id}`,
      description: 'desc',
      isbn: `isbn-${id}`,
      author: 'Author',
      category: 'FANTASY',
      price: 10,
      stockQuantity: 3,
    };
  }

  async function createAuthenticatedComponent(): Promise<void> {
    userState = TestBed.inject(UserState);
    userState.setUser(authenticatedUser);

    fixture = TestBed.createComponent(BookDashboard);
    component = fixture.componentInstance;

    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookDashboard],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', async () => {
    await createAuthenticatedComponent();
    httpMock.expectOne(matchBooksRequest).flush(emptyPage());

    expect(component).toBeTruthy();
  });

  it('redirects to the home page and makes no request when not authenticated', async () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    fixture = TestBed.createComponent(BookDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith(['']);
    httpMock.expectNone(matchBooksRequest);
  });

  it('loads the first page of books on init with the default page/size/sort', async () => {
    await createAuthenticatedComponent();

    const req = httpMock.expectOne(matchBooksRequest);
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    expect(req.request.params.get('sort')).toBe('title,asc');

    const response = emptyPage({ content: [makeBook(1), makeBook(2)], totalElements: 2, totalPages: 1 });
    req.flush(response);
    await fixture.whenStable();

    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBeNull();
    expect(component.books()?.length).toBe(2);
    expect(component.totalElements()).toBe(2);
    expect(component.totalPages()).toBe(1);
  });

  it('navigates to another page while preserving the current filters', async () => {
    await createAuthenticatedComponent();
    httpMock.expectOne(matchBooksRequest).flush(emptyPage({ totalElements: 30, totalPages: 3 }));
    await fixture.whenStable();

    component.category.set('FANTASY');
    component.onPageChange({ page: 1, rows: 10, first: 10 });
    await fixture.whenStable();

    const req = httpMock.expectOne(matchBooksRequest);
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('category')).toBe('FANTASY');

    req.flush(emptyPage({ page: 1, totalElements: 30, totalPages: 3 }));
    await fixture.whenStable();

    expect(component.page()).toBe(1);
  });

  it('changes the page size and refetches with the new size, resetting to page 0 via the paginator event', async () => {
    await createAuthenticatedComponent();
    httpMock.expectOne(matchBooksRequest).flush(emptyPage({ totalElements: 45 }));
    await fixture.whenStable();

    component.onPageChange({ page: 0, rows: 20, first: 0 });
    await fixture.whenStable();

    const req = httpMock.expectOne(matchBooksRequest);
    expect(req.request.params.get('size')).toBe('20');
    expect(req.request.params.get('page')).toBe('0');

    req.flush(emptyPage({ size: 20, totalElements: 45 }));
    await fixture.whenStable();

    expect(component.size()).toBe(20);
  });

  it('resets to the first page when the search query changes', async () => {
    await createAuthenticatedComponent();
    httpMock.expectOne(matchBooksRequest).flush(emptyPage({ totalElements: 30, totalPages: 3 }));
    await fixture.whenStable();

    component.onPageChange({ page: 2, rows: 10, first: 20 });
    await fixture.whenStable();
    httpMock.expectOne(matchBooksRequest).flush(emptyPage({ page: 2, totalElements: 30, totalPages: 3 }));
    await fixture.whenStable();

    expect(component.page()).toBe(2);

    component.searchQuery.set('dune');
    component.handleSubmit();
    await fixture.whenStable();

    const req = httpMock.expectOne(matchBooksRequest);
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('query')).toBe('dune');

    req.flush(emptyPage({ totalElements: 1, totalPages: 1 }));
  });

  it('resets to the first page when a filter changes', async () => {
    await createAuthenticatedComponent();
    httpMock.expectOne(matchBooksRequest).flush(emptyPage({ totalElements: 30, totalPages: 3 }));
    await fixture.whenStable();

    component.onPageChange({ page: 2, rows: 10, first: 20 });
    await fixture.whenStable();
    httpMock.expectOne(matchBooksRequest).flush(emptyPage({ page: 2, totalElements: 30, totalPages: 3 }));
    await fixture.whenStable();

    component.category.set('HISTORY');
    component.handleSubmit();
    await fixture.whenStable();

    const req = httpMock.expectOne(matchBooksRequest);
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('category')).toBe('HISTORY');

    req.flush(emptyPage({ totalElements: 0, totalPages: 0 }));
  });

  it('handles an empty result set without crashing and shows the empty state', async () => {
    await createAuthenticatedComponent();
    httpMock.expectOne(matchBooksRequest).flush(emptyPage());
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.books()).toEqual([]);
    expect(component.totalElements()).toBe(0);

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('No books found');
  });

  it('sets an error message and stops loading when the API call fails', async () => {
    await createAuthenticatedComponent();

    httpMock
      .expectOne(matchBooksRequest)
      .flush('boom', { status: 500, statusText: 'Internal Server Error' });
    await fixture.whenStable();

    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBe('Failed to load books');
    expect(component.pageResponse()).toBeNull();
  });

  it('cancels a stale in-flight request when the page changes again before it resolves', async () => {
    await createAuthenticatedComponent();
    httpMock.expectOne(matchBooksRequest).flush(emptyPage({ totalElements: 30, totalPages: 3 }));
    await fixture.whenStable();

    component.onPageChange({ page: 1, rows: 10, first: 10 });
    await fixture.whenStable();

    component.onPageChange({ page: 2, rows: 10, first: 20 });
    await fixture.whenStable();

    const requests = httpMock.match(matchBooksRequest);
    expect(requests.length).toBe(2);

    const [stalePageRequest, latestPageRequest] = requests;
    expect(stalePageRequest.request.params.get('page')).toBe('1');
    expect(stalePageRequest.cancelled).toBe(true);
    expect(latestPageRequest.request.params.get('page')).toBe('2');

    latestPageRequest.flush(
      emptyPage({ page: 2, content: [makeBook(99)], totalElements: 30, totalPages: 3 }),
    );
    await fixture.whenStable();

    expect(component.page()).toBe(2);
    expect(component.books()?.[0]?.id).toBe(99);
  });
});
