import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterTransactionComponent } from './register-transaction/register-transaction.component';
import { TransactionDetailComponent } from './transaction-detail/transaction-detail.component';
import { TransactionTableComponent } from './transaction-table/transaction-table.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    RegisterTransactionComponent,
    TransactionDetailComponent,
    TransactionTableComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {path:"transaction/register" , component: RegisterTransactionComponent},
      {path:"transaction/view/:id" , component: TransactionDetailComponent},
      {path:"transaction/view/:queryId/:id" , component: TransactionDetailComponent}
    ])
  ]
})
export class TransactionsModule { }
