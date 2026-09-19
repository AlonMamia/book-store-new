import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookDashboard } from './book-dashboard';

describe('BookDashboard', () => {
  let component: BookDashboard;
  let fixture: ComponentFixture<BookDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(BookDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
