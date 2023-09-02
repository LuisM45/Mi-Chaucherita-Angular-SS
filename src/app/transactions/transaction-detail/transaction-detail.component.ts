import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Transaction } from 'src/app/interfaces/transaction.interface';
import { TransactionsService } from 'src/app/shared/transactions.service';
import { toLocalStringUpToMinute } from 'src/app/shared/utils';

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.scss']
})
export class TransactionDetailComponent {
  response: Transaction = {
    title: '',
    amount: 0,
    timeOfTransaction: new Date(),
    description: ''
  }
  nextId: string = ""
  prevId: string = ""

  constructor(
    private route: ActivatedRoute,
    private transactions: TransactionsService
  ){
    route.paramMap.subscribe(i=>{
      console.log(i)
      this.loadTransactionData(i.get('id')!!)
    }
    )
    
  }

  loadTransactionData(id: string){
    this.transactions.getTransaction(id)
    .then( i=>{
      console.log(i)
      this.response = i.result[0]
      this.nextId = i.nextId??""
      this.prevId = i.previousId??""
    }
    ).catch(e=>
      console.log(e)
    )
    
  }
}
