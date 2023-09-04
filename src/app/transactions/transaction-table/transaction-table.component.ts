import { Component } from '@angular/core';
import { PagedQuery } from 'src/app/interfaces/query.interface';
import { Transaction } from 'src/app/interfaces/transaction.interface';
import { TransactionsService } from 'src/app/shared/transactions.service';

@Component({
  selector: 'app-transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['./transaction-table.component.scss']
})
export class TransactionTableComponent {

  response: PagedQuery<Transaction> = {
    id: '',
    result: []
  }
  constructor(
    private transactionService: TransactionsService
  ){
    transactionService.getTransactionList().then(tl=>{
      console.log("svc response")
      console.log(tl)
      this.response = tl
    }).catch(e=>console.log(e))
  }

  touchDescription() {
    throw new Error('Method not implemented.');
  }

  touchDatetime() {
    throw new Error('Method not implemented.');
  }

  touchAmount() {
    throw new Error('Method not implemented.');
  }

  touchTitle() {
    throw new Error('Method not implemented.');
  }

  navigatePrevious() {
    if(!this.response.prevPage) return
    this.response.prevPage().then(page=>{
      this.response = page
    })
  }

  navigateNext() {
    if(!this.response.nextPage) return
    this.response.nextPage().then(page=>{
      this.response = page
    })
  }
}
