import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { UserState } from '../../../../user/services/user-state';
import { BookListItem } from '../../../components/book-list-item/book-list-item';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../core/auth/services/auth-service';
import { tap } from 'rxjs';

interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  status: 'Featured' | 'Bestseller' | 'New';
  coverGradient: string;
  shortLabel: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, CardModule],
  selector: 'app-book-dashboard',
  styleUrl: './book-dashboard.scss',
  templateUrl: './book-dashboard.html',
})
export class BookDashboard {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly userState = inject(UserState);
  readonly books = signal<Book[]>([]);

  ngOnInit() {
    if (!this.userState.isAuthenticated()) {
      this.router.navigate(['']);
    }
  }

  logout(): void {
    this.authService.logout()
      .pipe(tap(() => this.userState.clearUser()))
      .subscribe(() => {
      this.router.navigate(['']);
    });
  }
  // readonly books: Book[] = [
  //   {
  //     id: 1,
  //     title: 'The Blue Hour',
  //     author: 'Alicia Morgan',
  //     category: 'Fiction',
  //     price: 24,
  //     rating: 4.9,
  //     reviews: 326,
  //     status: 'Featured',
  //     coverGradient: 'linear-gradient(135deg, #dbeafe 0%, #60a5fa 100%)',
  //     shortLabel: 'BH',
  //   },
  //   {
  //     id: 2,
  //     title: 'Designing for Calm',
  //     author: 'Leo Hart',
  //     category: 'Design',
  //     price: 32,
  //     rating: 4.8,
  //     reviews: 241,
  //     status: 'Bestseller',
  //     coverGradient: 'linear-gradient(135deg, #d1fae5 0%, #34d399 100%)',
  //     shortLabel: 'DC',
  //   },
  //   {
  //     id: 3,
  //     title: 'Python for Curious Minds',
  //     author: 'Maya Patel',
  //     category: 'Technology',
  //     price: 28,
  //     rating: 4.7,
  //     reviews: 198,
  //     status: 'New',
  //     coverGradient: 'linear-gradient(135deg, #e9d5ff 0%, #a78bfa 100%)',
  //     shortLabel: 'PM',
  //   },
  //   {
  //     id: 4,
  //     title: 'Quiet Leadership',
  //     author: 'Jonas Reed',
  //     category: 'Business',
  //     price: 29,
  //     rating: 4.9,
  //     reviews: 410,
  //     status: 'Bestseller',
  //     coverGradient: 'linear-gradient(135deg, #fee2e2 0%, #f87171 100%)',
  //     shortLabel: 'QL',
  //   },
  //   {
  //     id: 5,
  //     title: 'The Long View',
  //     author: 'Nina Foster',
  //     category: 'History',
  //     price: 26,
  //     rating: 4.6,
  //     reviews: 158,
  //     status: 'New',
  //     coverGradient: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)',
  //     shortLabel: 'LV',
  //   },
  //   {
  //     id: 6,
  //     title: 'Clever Habits',
  //     author: 'Rafael Quinn',
  //     category: 'Self-Help',
  //     price: 21,
  //     rating: 4.8,
  //     reviews: 289,
  //     status: 'Featured',
  //     coverGradient: 'linear-gradient(135deg, #cffafe 0%, #22d3ee 100%)',
  //     shortLabel: 'CH',
  //   },
  // ];
}
