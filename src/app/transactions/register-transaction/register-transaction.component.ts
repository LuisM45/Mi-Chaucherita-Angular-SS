import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Transaction } from 'src/app/interfaces/transaction.interface';
import { TransactionsService } from 'src/app/shared/transactions.service';
import { dateStringToDate, toLocalStringUpToMinute } from 'src/app/shared/utils';

@Component({
  selector: 'app-register-transaction',
  templateUrl: './register-transaction.component.html',
  styleUrls: ['./register-transaction.component.scss']
})
export class RegisterTransactionComponent {
  accountId?: string
  title: string = ""
  amount: number = 0
  datetime: string = toLocalStringUpToMinute(new Date())
  description: string = ""

  constructor(
    public transactionService: TransactionsService,
    public router:Router,
    public activatedRoute:ActivatedRoute
  ){
    activatedRoute.paramMap.subscribe( pm=> {this.accountId = pm.get("accountId")!!})
  }

  register(){
    var transaction:Transaction = {
      title: this.title,
      amount: this.amount,
      timeOfTransaction: dateStringToDate(this.datetime),
      description: this.description
    }

    this.transactionService.registerTransaction(
      this.accountId!!,
      transaction 
    ).then(a=>{this.router.navigate(['/','account-view',this.accountId])})
  }
  
}
