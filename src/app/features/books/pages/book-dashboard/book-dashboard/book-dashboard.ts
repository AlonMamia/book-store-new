import { CommonModule } from '@angular/common';
import { Component, computed, inject, Signal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { UserState } from '../../../../user/services/user-state';
import { BookListItem } from '../../../components/book-list-item/book-list-item';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../core/auth/services/auth-service';
import { catchError, defer, filter, finalize, of, switchMap, tap } from 'rxjs';
import { Select } from 'primeng/select';
import { Category } from '../../../models/Category';
import { BookService } from '../../../services/book-service';
import { BookFilters, BookSearchRequest } from '../../../models/BookFilters';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { InputText } from 'primeng/inputtext';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    Select,
    Paginator,
    BookListItem,
    InputText,
  ],
  selector: 'app-book-dashboard',
  styleUrl: './book-dashboard.scss',
  templateUrl: './book-dashboard.html',
})
export class BookDashboard {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly userState = inject(UserState);
  private readonly bookService = inject(BookService);
  readonly categories = Object.values(Category);
  readonly sortCategories = ['author', 'price', 'title'];
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private readonly requestToSend = signal<BookSearchRequest | null>(null);

  searchQuery = signal<string>('');
  category = signal<string>('');
  minPrice = signal<number>(0);
  maxPrice = signal<number>(0);
  availableOnly = signal<boolean>(false);
  sortBy = signal<'author' | 'price' | 'title'>('title');

  page = signal<number>(0);
  size = signal<number>(10);
  direction = signal<'asc' | 'desc'>('asc');

  ngOnInit() {
    if (!this.userState.isAuthenticated()) {
      this.router.navigate(['']);
    } else {
      this.sendRequest();
    }
  }

  logout(): void {
    this.authService
      .logout()
      .pipe(tap(() => this.userState.clearUser()))
      .subscribe(() => {
        this.router.navigate(['']);
      });
  }

  readonly bookFilter: Signal<BookFilters> = computed<BookFilters>(() => {
    return {
      query: this.searchQuery().trim(),
      category: this.category() || null,
      minPrice: this.minPrice(),
      maxPrice: this.maxPrice(),
      availableOnly: this.availableOnly(),
    };
  });

  // readonly books = computed(
  //   () => this.pageResponse()?.content ?? []
  // );

  readonly bookSearchRequest = computed<BookSearchRequest>(() => ({
    filters: this.bookFilter(),
    pageRequest: {
      page: this.page(),
      size: this.size(),
      sort: this.sortBy(),
      direction: this.direction(),
    },
  }));

  private readonly requestToSend$ = toObservable(this.requestToSend);

  private readonly pageResponse$ = this.requestToSend$.pipe(
    filter((request): request is BookSearchRequest => request !== null),

    switchMap((request) =>
      defer(() => {
        this.loading.set(true);
        this.errorMessage.set(null);

        return this.bookService.getFilteredBooks(request).pipe(
          catchError((error) => {
            console.error('Failed to load books', error);
            this.errorMessage.set('Failed to load books');

            return of(null);
          }),

          finalize(() => {
            this.loading.set(false);
          }),
        );
      }),
    ),
  );

  readonly pageResponse = toSignal(this.pageResponse$, { initialValue: null });

  readonly books = computed(() => this.pageResponse()?.content);
  readonly totalElements = computed(() => this.pageResponse()?.totalElements ?? 0);
  readonly totalPages = computed(() => this.pageResponse()?.totalPages ?? 0);

  onPageChange(event: PaginatorState): void {
    const newSize = event.rows ?? this.size();
    const newPage = event.page ?? 0;

    if (newPage < 0 || newSize <= 0) {
      return;
    }

    this.page.set(newPage);
    this.size.set(newSize);

    this.sendRequest();
  }

  handleSubmit(): void {
    this.page.set(0);

    this.sendRequest();
  }

  private sendRequest(): void {
    const request = this.bookSearchRequest();

    this.requestToSend.set({
      filters: {
        ...request.filters,
      },
      pageRequest: {
        ...request.pageRequest,
      },
    });
  }
}
