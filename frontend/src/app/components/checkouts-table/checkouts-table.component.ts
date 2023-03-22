import { Component, OnInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { CheckoutService } from '../../services/checkout.service';
import { Observable } from 'rxjs';
import { Page } from '../../models/page';
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

  constructor(
    private checkoutService: CheckoutService,
  ) {
  }

  ngOnInit(): void {
    // TODO this observable should emit books taking into consideration pagination, sorting and filtering options.
    this.checkouts$ = this.checkoutService.getCheckOuts({});

    // Converts a page of checkouts into a suitable array for mat-table to use as a dataSource.
    this.checkouts$.subscribe(page => {
      const checkoutArray = page.content;
      this.dataSource = new MatTableDataSource(checkoutArray);
    });

  }

}
