import { Component, input } from '@angular/core';
import { Book } from '../../models/Book';
import { Card } from 'primeng/card';

@Component({
  imports: [Card],
  selector: 'book-list-item',
  styleUrl: './book-list-item.scss',
  templateUrl: './book-list-item.html',
})
export class BookListItem {
  readonly book = input<Book>();
}
