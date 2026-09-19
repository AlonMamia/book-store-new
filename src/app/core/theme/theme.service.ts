import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  isDarkMode = signal<boolean>(false);

  toggleDarkMode(): void {
    this.isDarkMode.update((prev) => !prev);
    const element = document.querySelector('html');

    if (element) {
      element.classList.toggle('bookstore-dark', this.isDarkMode());
    }
  }
}
