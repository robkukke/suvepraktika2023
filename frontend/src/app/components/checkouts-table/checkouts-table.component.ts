import { Component, OnInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { CheckoutService } from '../../services/checkout.service';
import { Observable } from 'rxjs';
import { Page, PageRequest } from '../../models/page';
import { Checkout } from '../../models/checkout';

// RegEx function to separate words in the heading, while capitalizing the first letter of the first word in the heading.
function transformHeading(heading: string): string {
  return heading
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/^\w/, c => c.toUpperCase());
}

@Component({
  selector: 'app-checkouts-table',
  templateUrl: './checkouts-table.component.html',
  styleUrls: ['./checkouts-table.component.scss']
})
export class CheckoutsTableComponent implements OnInit {

  // Information columns to display in the table.
  displayedColumns: string[] = ['borrowerFirstName', 'borrowerLastName', 'borrowedBook', 'checkedOutDate', 'dueDate', 'returnedDate'];

  // Method that calls transformHeading function on every column name.
  getDisplayHeading(column: string): string {
    return transformHeading(column);
  }

  checkouts$!: Observable<Page<Checkout>>;

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
    private checkoutService: CheckoutService,
  ) {
  }

  ngOnInit(): void {
    this.checkouts$ = this.checkoutService.getCheckOuts({});

    // Converts a page of checkouts into a suitable array for mat-table to use as a dataSource.
    this.checkouts$.subscribe(page => {
      const checkoutArray = page.content;
      this.dataSource = new MatTableDataSource(checkoutArray);
    });

  }

  // Handles the events of the user changing pageSize and pageIndex, then showing the updated mat-table.
    handlePageEvent(event: PageEvent) {
      this.pageRequest.pageIndex = event.pageIndex;
      this.pageRequest.pageSize = event.pageSize;

      this.checkouts$ = this.checkoutService.getCheckOuts(this.pageRequest);

      this.checkouts$.subscribe(page => this.dataSource.data = page.content);
    }

    // Sorts data based on the active column and sort direction.
    sortData(event: any) {
      this.pageRequest.sort = event.active;
      this.pageRequest.direction = event.direction;

      // Check if the active column is borrowedBook, because initially it is an object.
      if (event.active === 'borrowedBook') {
        this.pageRequest.sort = 'borrowedBook.title';
      }

      this.checkouts$ = this.checkoutService.getCheckOuts(this.pageRequest);

      this.checkouts$.subscribe(page => this.dataSource.data = page.content);
    }

}
