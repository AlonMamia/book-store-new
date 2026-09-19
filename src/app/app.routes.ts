import { Routes } from '@angular/router';
import { BookDashboard } from './features/books/pages/book-dashboard/book-dashboard/book-dashboard';
import { Login } from './features/user/pages/login/login';

export const routes: Routes = [
  { path: '', component: Login },
  { path: '/login', redirectTo: '' },
  { path: 'books', component: BookDashboard },
];
