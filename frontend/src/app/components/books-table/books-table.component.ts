import { Component, OnInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { BookService } from '../../services/book.service';
import { Observable } from 'rxjs';
import { Page } from '../../models/page';
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

  constructor(
    private bookService: BookService,
  ) {
  }

  ngOnInit(): void {
    // TODO this observable should emit books taking into consideration pagination, sorting and filtering options.
    this.books$ = this.bookService.getBooks({});

    // Converts a page of books into a suitable array for mat-table to use as a dataSource.
    this.books$.subscribe(page => {
      const bookArray = page.content;
      this.dataSource = new MatTableDataSource(bookArray);
    });

  }

}
