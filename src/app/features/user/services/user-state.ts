import { computed, Service, signal } from '@angular/core';
import { User } from '../models/User';
import { Role } from '../../../core/auth/enums/Role';

@Service()
export class UserState {
  private readonly userSignal = signal<User | null>(null);

  readonly user = this.userSignal.asReadonly();

  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  readonly isAdmin = computed(() => {
    return this.userSignal()?.role === Role.ADMIN;
  });

  setUser(user: User | null): void {
    this.userSignal.set(user);
  }

  clearUser(): void {
    this.userSignal.set(null);
  }
}
