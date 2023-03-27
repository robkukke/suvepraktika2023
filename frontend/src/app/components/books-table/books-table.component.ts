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

  // Variable to hold the term inserted into the search field.
  searchTerm = '';

  constructor(
    private bookService: BookService,
  ) {
  }

  ngOnInit(): void {
    this.books$ = this.bookService.getBooks(this.pageRequest);

    // Method to only show books that have a criteria matching the searchTerm.
    const filterBooks = (books: Book[]) => {
      const searchText = this.searchTerm.toLowerCase();

      return books.filter((book: Book) => {
        return book.title.toLowerCase().includes(searchText) ||
               book.author.toLowerCase().includes(searchText) ||
               book.genre.toLowerCase().includes(searchText) ||
               book.year.toString().includes(searchText) ||
               book.status.toLowerCase().includes(searchText);
      });
    };

    // Converts a page of books into a suitable array for mat-table to use as a dataSource.
    // Help received from: https://www.angularjswiki.com/material/mat-table-filterpredicate/
    this.books$.subscribe(page => {
      const bookArray = filterBooks(page.content);
      this.dataSource = new MatTableDataSource(bookArray);
      this.dataSource.filterPredicate = (data: Book, filter: string) => {
        return filterBooks([data]).length > 0;
      };
    });

    // Listen for changes to searchTerm and update the mat-table dataSource.
    const searchInput = document.querySelector('input[matInput][type="text"]');
    if (searchInput) {
      searchInput.addEventListener('keyup', () => {
        const filteredBooks = filterBooks(this.dataSource.data);
        this.dataSource.filter = this.searchTerm.toLowerCase();
        this.dataSource.data = filteredBooks;
      });
    }

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
