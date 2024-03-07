import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FixedPointDecimal } from 'src/app/classes/FixedPointDecimal.class';
import { Account } from 'src/app/interfaces/accout.interface';
import { Transaction } from 'src/app/interfaces/transaction.interface';
import { AccountService } from 'src/app/shared/account.service';
import { TransactionsService } from 'src/app/shared/transactions.service';
import { dateStringToDate, toLocalStringUpToMinute } from 'src/app/shared/utils';

@Component({
  selector: 'app-transaction-edit',
  templateUrl: './transaction-edit.component.html',
  styleUrls: ['./transaction-edit.component.scss']
})
export class TransactionEditComponent implements OnInit{
  account?: Promise<Account>
  
  id: string = ""
  accountId: string = ""
  title: string = ""
  amount: number = 0
  datetime: string = toLocalStringUpToMinute(new Date())
  description: string = ""


  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(pm=>{
      this.id = pm.get("id")!!
      this.accountId = pm.get("accountId")!!
      this.account = this.accountService.getAccount(this.accountId!)
      
    this.transactionService.getTransactionOnly(this.accountId,this.id)
        .then(t=>{
          this.title = t.title
          this.amount = Number(t.amount.toString())
          this.datetime = toLocalStringUpToMinute(t.timeOfTransaction)
          this.description = t.description
        })
    })
  }
  
  

  constructor(
    public accountService: AccountService,
    public transactionService: TransactionsService,
    public router:Router,
    public activatedRoute: ActivatedRoute
  ){  }
    


  async update(){
    const account = await this.account
    if(account?.type != "income and spending"){
      throw new Error("Negative values only allowed for 'income and spending' accounts only")
    }

    const transaction:Transaction = {
      id: this.id,
      title: this.title,
      amount: FixedPointDecimal.valueOf(this.amount.toString()),
      timeOfTransaction: new Date(this.datetime),
      description: this.description
    }

    this.transactionService.updateTransaction(
      this.accountId,
      this.id,
      transaction
    ).then(a=>{this.router.navigate(['/','transaction','view',this.accountId,this.id])})
    .catch(console.error)
  }

}
