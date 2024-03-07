import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FixedPointDecimal } from 'src/app/classes/FixedPointDecimal.class';
import { Account } from 'src/app/interfaces/accout.interface';
import { Transaction } from 'src/app/interfaces/transaction.interface';
import { AccountService } from 'src/app/shared/account.service';
import { TransactionsService } from 'src/app/shared/transactions.service';
import { dateStringToDate, toLocalStringUpToMinute } from 'src/app/shared/utils';

@Component({
  selector: 'app-register-transaction',
  templateUrl: './register-transaction.component.html',
  styleUrls: ['./register-transaction.component.scss']
})
export class RegisterTransactionComponent {
  accountId?: string
  account?: Promise<Account>
  title: string = ""
  amount: number = 0
  datetime: string = toLocalStringUpToMinute(new Date())
  description: string = ""

  isValueValid = true

  constructor(
    public accountService: AccountService,
    public transactionService: TransactionsService,
    public router:Router,
    public activatedRoute:ActivatedRoute
  ){
    activatedRoute.paramMap.subscribe( pm=> {
      this.accountId = pm.get("accountId")!!
      this.account = accountService.getAccount(this.accountId!)
    })
  }


  async register(){
    const account = await this.account
    if(this.amount<0 && account?.type != "income and spending"){
      this.isValueValid = false
      throw new Error("Negative values only allowed for 'income and spending' accounts only")
    }
    this.isValueValid = true


    var transaction:Transaction = {
      title: this.title,
      amount: FixedPointDecimal.valueOf(this.amount.toString()),
      timeOfTransaction: dateStringToDate(this.datetime),
      description: this.description
    }

    this.transactionService.registerTransaction(
      this.accountId!!,
      transaction 
    ).then(a=>{this.router.navigate(['/','account-view',this.accountId])})
  }
  
}
