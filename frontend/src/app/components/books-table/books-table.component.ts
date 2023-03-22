import { Component, OnInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { BookService } from '../../services/book.service';
import { Observable } from 'rxjs';
import { Page, PageRequest } from '../../models/page';
import { Book } from '../../models/book';

@Component({
  selector: 'app-books-table',
  templateUrl: './books-table.component.html',
  styleUrls: ['./books-table.component.scss']
})
export class BooksTableComponent implements OnInit {

  // Information columns to display in the table.
  displayedColumns: string[] = ['title', 'author', 'genre', 'year', 'status'];

  books$!: Observable<Page<Book>>;

  // dataSource for mat-table to use.
  dataSource!: MatTableDataSource<any>;

  // mat-paginator options.
  pageSizeOptions = [10, 25, 50, 100];
  showFirstLastButtons = true;

  // PageRequest default options.
  pageRequest: PageRequest = {
    pageIndex: 0,
    pageSize: 25
  };

  constructor(
    private bookService: BookService,
  ) {
  }

  ngOnInit(): void {
    this.books$ = this.bookService.getBooks(this.pageRequest);

    // Converts a page of books into a suitable array for mat-table to use as a dataSource.
    this.books$.subscribe(page => {
      const bookArray = page.content;
      this.dataSource = new MatTableDataSource(bookArray);
    });

  }

  // Handles the events of the user changing pageSize and pageIndex, then showing the updated mat-table.
  handlePageEvent(event: PageEvent) {
    this.pageRequest.pageIndex = event.pageIndex;
    this.pageRequest.pageSize = event.pageSize;

    this.books$ = this.bookService.getBooks(this.pageRequest);

    this.books$.subscribe(page => this.dataSource.data = page.content);
  }

  // Sorts data based on the active column and sort direction.
  sortData(event: any) {
    this.pageRequest.sort = event.active;
    this.pageRequest.direction = event.direction;

    this.books$ = this.bookService.getBooks(this.pageRequest);

    this.books$.subscribe(page => this.dataSource.data = page.content);
  }

}
