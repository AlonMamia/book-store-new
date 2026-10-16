import { Routes } from '@angular/router';
import { BookDashboard } from './features/books/pages/book-dashboard/book-dashboard/book-dashboard';
import { Login } from './features/user/pages/login/login';
import { Register } from './features/user/pages/register/register';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'login', redirectTo: '', component: Login },
  { path: 'books', component: BookDashboard },
  { path: 'register', component: Register }
];
