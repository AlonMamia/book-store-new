import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { environment } from '../environments/environment.local';
import { AuraPreset } from './core/theme/aura.preset';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './core/auth/services/auth-service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),

    provideAppInitializer(() => {
      const authService = inject(AuthService);

      return authService.initializeCsrf();
    }),

    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    providePrimeNG({
      license: environment.primeUiLicense,

      theme: {
        preset: AuraPreset,
        options: {
          darkModeSelector: 'bookstore-dark',
        },
      },
    }),
  ],
};
