import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { CheckoutService } from '../../services/checkout.service';
import { Checkout } from '../../models/checkout';
import { Book } from '../../models/book';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-checkout-detail',
  templateUrl: './checkout-detail.component.html',
  styleUrls: ['./checkout-detail.component.scss']
})
export class CheckoutDetailComponent implements OnInit {

  checkout$!: Observable<Checkout>;

  // Variable to store the original book object for the saveCheckOut() method.
  borrowedBook!: Book;

  // FormGroup for the HTML form.
  checkoutForm!: FormGroup;

  // All fields to display in the form, with their label, formControlName and type.
  fields = [
    { label: 'ID', formControlName: 'id', type: 'text' },
    { label: 'Borrower first name', formControlName: 'borrowerFirstName', type: 'text' },
    { label: 'Borrower last name', formControlName: 'borrowerLastName', type: 'text' },
    { label: 'Borrowed book', formControlName: 'borrowedBook', type: 'text' },
    { label: 'Checked out date', formControlName: 'checkedOutDate', type: 'text' },
    { label: 'Due date', formControlName: 'dueDate', type: 'text' },
    { label: 'Returned date', formControlName: 'returnedDate', type: 'text' },
  ];

  constructor(
    private route: ActivatedRoute,
    private checkoutService: CheckoutService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.checkout$ = this.route.params.pipe(
      map(params => params['id']),
      switchMap(id => this.checkoutService.getCheckOut(id))
    );

    // Storing the original book object in the borrowedBook variable.
    this.checkout$.subscribe(checkout => {
      this.borrowedBook = checkout.borrowedBook;
    });

    // New form group initialization.
    this.checkoutForm = this.formBuilder.group({});

    // Create a new form control for every field, set their value as null and disable them, add them to the checkoutForm.
    this.fields.forEach(field => {
      this.checkoutForm.addControl(field.formControlName, new FormControl({value: null, disabled:true}));
    });

    // Set the value of every field in the checkoutForm.
    this.checkout$.subscribe((checkout) => {
      this.checkoutForm.setValue({
        id: checkout.id,
        borrowerFirstName: checkout.borrowerFirstName,
        borrowerLastName: checkout.borrowerLastName,
        borrowedBook: checkout.borrowedBook.title,
        checkedOutDate: checkout.checkedOutDate,
        dueDate: checkout.dueDate,
        returnedDate: checkout.returnedDate,
      });
    });

  }

  // isEditable variable for checking if the form is in view or edit state.
  isEditable = false;

  // originalCheckout variable for storing values before editing, in case the Cancel button is clicked.
  private originalCheckout: any = {};

  // Checks whether the button is in Delete or Cancel state.
  handleDeleteAndCancelButtonClick() {
    if (this.isEditable) {
      // If the form is editable and the Cancel button is clicked, it reverts the values to original values and disables the form.
      this.isEditable = false;

      this.checkoutForm.setValue(this.originalCheckout);
      this.checkoutForm.disable();
    } else {
      // If the form is not editable and the Delete button is clicked, it deletes the checkout and navigates back to the table view.
      // Back-end solution not yet implemented.
      this.checkout$.pipe(
        map(checkout => checkout.id),
        switchMap(id => this.checkoutService.deleteCheckOut(id))
      ).subscribe(() => {
         this.router.navigate(['/checkouts']);
       });
    }
  }

  // Checks whether the button is in Edit or Cancel state.
  handleEditAndSaveButtonClick() {
    this.isEditable = !this.isEditable;

    if (this.isEditable) {
      // If the form is editable, it saves the original values to originalCheckout, in case the Cancel button is clicked.
      this.originalCheckout = { ...this.checkoutForm.value };
    } else {
      // If the Save button is clicked, the updatedCheckout variable is populated with all values, including changed ones, and then sent to the saveCheckOut() method.
      // Back-end solution not yet implemented.
      const updatedCheckout = {
        id: this.checkoutForm.get('id')?.value,
        borrowerFirstName: this.checkoutForm.get('borrowerFirstName')?.value,
        borrowerLastName: this.checkoutForm.get('borrowerLastName')?.value,
        borrowedBook: this.borrowedBook,
        checkedOutDate: this.checkoutForm.get('checkedOutDate')?.value,
        dueDate: this.checkoutForm.get('dueDate')?.value,
        returnedDate: this.checkoutForm.get('returnedDate')?.value
      };

      this.checkoutService.saveCheckOut(updatedCheckout).subscribe();
    }

    // Enabling and disabling fields that should be editable depending on the form state.
    this.fields.forEach(field => {
      const individualField = this.checkoutForm.get(field.formControlName);

      if (this.isEditable && ['borrowerFirstName', 'borrowerLastName', 'checkedOutDate', 'dueDate', 'returnedDate'].includes(field.formControlName) && individualField) {
        individualField.enable();
      } else if (individualField) {
        individualField.disable();
      }
    });
  }

}
