import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterTransactionComponent } from './register-transaction/register-transaction.component';
import { TransactionDetailComponent } from './transaction-detail/transaction-detail.component';
import { TransactionTableComponent } from './transaction-table/transaction-table.component';



@NgModule({
  declarations: [
    RegisterTransactionComponent,
    TransactionDetailComponent,
    TransactionTableComponent
  ],
  imports: [
    CommonModule
  ]
})
export class TransactionsModule { }
