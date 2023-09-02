import { Component } from '@angular/core';
import { Transaction } from 'src/app/interfaces/transaction.interface';
import { TransactionsService } from 'src/app/shared/transactions.service';
import { dateStringToDate, toLocalStringUpToMinute } from 'src/app/shared/utils';

@Component({
  selector: 'app-register-transaction',
  templateUrl: './register-transaction.component.html',
  styleUrls: ['./register-transaction.component.scss']
})
export class RegisterTransactionComponent {
  title: string = ""
  amount: number = 0
  datetime: string = toLocalStringUpToMinute(new Date())
  description: string = ""

  constructor(
    public transactionService: TransactionsService
  ){

    console.log(this.datetime)
  }

  register(){
    var transaction:Transaction = {
      title: this.title,
      amount: this.amount,
      timeOfTransaction: dateStringToDate(this.datetime),
      description: this.description
    }

    this.transactionService.registerTransaction(
      transaction 
    )
   console.log(transaction) 
  }
  
}
