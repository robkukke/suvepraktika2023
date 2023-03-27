import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss']
})
export class BookDetailComponent implements OnInit {

  book$!: Observable<Book>;

  // FormGroup for the HTML form.
  bookForm!: FormGroup;

  // All fields to display in the form, with their label, formControlName and type.
  fields = [
    { label: 'ID', formControlName: 'id', type: 'text' },
    { label: 'Title', formControlName: 'title', type: 'text' },
    { label: 'Author', formControlName: 'author', type: 'text' },
    { label: 'Genre', formControlName: 'genre', type: 'text' },
    { label: 'Year', formControlName: 'year', type: 'number' },
    { label: 'Added', formControlName: 'added', type: 'text' },
    { label: 'Checkout count', formControlName: 'checkOutCount', type: 'number' },
    { label: 'Status', formControlName: 'status', type: 'text' },
    { label: 'Due date', formControlName: 'dueDate', type: 'text' },
    { label: 'Comment', formControlName: 'comment', type: 'text' },
  ];

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.book$ = this.route.params.pipe(
      map(params => params['id']),
      switchMap(id => this.bookService.getBook(id))
    );

    // New form group initialization.
    this.bookForm = this.formBuilder.group({});

    // Create a new form control for every field, set their value as null and disable them, add them to the bookForm.
    this.fields.forEach(field => {
      this.bookForm.addControl(field.formControlName, new FormControl({value: null, disabled:true}));
    });

    // Set the value of every field in the bookForm.
    this.book$.subscribe((book) => {
      this.bookForm.setValue(book);
    });

  }

  // isEditable variable for checking if the form is in view or edit state.
  isEditable = false;

  // originalBook variable for storing values before editing, in case the Cancel button is clicked.
  private originalBook: any = {};

  // updatedBook variable for storing values after editing, to forward to the saveBook() method.
  private updatedBook: any = {};

  // Checks whether the button is in Delete or Cancel state.
  handleDeleteAndCancelButtonClick() {
    if (this.isEditable) {
      // If the form is editable and the Cancel button is clicked, it reverts the values to original values and disables the form.
      this.isEditable = false;

      this.bookForm.setValue(this.originalBook);
      this.bookForm.disable();
    } else {
      // If the form is not editable and the Delete button is clicked, it deletes the book and navigates back to the table view.
      // Back-end solution not yet implemented.
      this.book$.pipe(
        map(book => book.id),
        switchMap(id => this.bookService.deleteBook(id))
      ).subscribe(() => {
         this.router.navigate(['/books']);
       });
    }
  }

  // Checks whether the button is in Edit or Cancel state.
  handleEditAndSaveButtonClick() {
    this.isEditable = !this.isEditable;

    if (this.isEditable) {
      // If the form is editable, it saves the original values to originalBook, in case the Cancel button is clicked.
      this.originalBook = { ...this.bookForm.value };
    } else {
      // If the Save button is clicked, the updatedBook variable is populated with all values, including changed ones, and then sent to the saveBook() method.
      // Updated books do not persist after server restarts.
      this.fields.forEach(field => {
        this.updatedBook[field.formControlName] = this.bookForm.get(field.formControlName)?.value;
      });

      this.bookService.saveBook(this.updatedBook).subscribe();
    }

    // Enabling and disabling fields that should be editable depending on the form state.
    this.fields.forEach(field => {
      const individualField = this.bookForm.get(field.formControlName);

      if (this.isEditable && ['title', 'author', 'genre', 'year', 'comment'].includes(field.formControlName) && individualField) {
        individualField.enable();
      } else if (individualField) {
        individualField.disable();
      }
    });
  }

}
