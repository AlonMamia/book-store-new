import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { concatMap, map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RegisterRequest } from '../models/RegisterRequest';
import { LoginRequest } from '../models/LoginRequest';
import { UserState } from '../../../features/user/services/user-state';
import { User } from '../../../features/user/models/User';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly userState = inject(UserState);

  private readonly authUrl = `${environment.apiUrl}/auth`;

  /**
   * נקרא פעם אחת בעליית האפליקציה.
   *
   * Spring יוצר XSRF-TOKEN cookie.
   * Angular תקרא אותו ותשלח אותו אוטומטית
   * כ-X-XSRF-TOKEN בבקשות משנות מידע.
   */
  initializeCsrf(): Observable<void> {
    return this.http.get<void>(`${this.authUrl}/csrf`);
  }

  register(request: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/register`, request);
  }

  login(request: LoginRequest): Observable<User> {
    return this.http
      .post<User>(`${this.authUrl}/login`, request)
      .pipe(concatMap((user) => this.initializeCsrf().pipe(map(() => user))));
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.authUrl}/me`);
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.authUrl}/logout`, {})
      .pipe(concatMap(() => this.initializeCsrf()));
  }
}
