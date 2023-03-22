import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { BooksListComponent } from './components/books-list/books-list.component';
import { BookDetailComponent } from './components/book-detail/book-detail.component';
import { BooksTableComponent } from './components/books-table/books-table.component';

const routes: Routes = [
  {path: '', redirectTo: 'books', pathMatch: 'full'},
  // {path: 'books', component: BooksListComponent},
  {path: 'books', component: BooksTableComponent},
  {path: 'books/:id', component: BookDetailComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
