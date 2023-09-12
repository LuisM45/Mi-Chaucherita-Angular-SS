import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Transaction } from 'src/app/interfaces/transaction.interface';
import { TransactionsService } from 'src/app/shared/transactions.service';
import { dateStringToDate, toLocalStringUpToMinute } from 'src/app/shared/utils';

@Component({
  selector: 'app-transaction-edit',
  templateUrl: './transaction-edit.component.html',
  styleUrls: ['./transaction-edit.component.scss']
})
export class TransactionEditComponent implements OnInit{

  
  id: string = ""
  accountId: string = ""
  transaction:Transaction = {
    id: "",
    title: "",
    amount: 0,
    timeOfTransaction: new Date(),
    description: ""
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(pm=>{
      this.id = pm.get("id")!!
      this.accountId = pm.get("accountId")!!
      
    this.transactionService.getTransaction(this.accountId,this.id)
        .then(t=>this.transaction=t.results[0].data)
    })
  }


  _timeOfTransaction:string = ""
  public get timeOfTransaction() : string {
    return toLocalStringUpToMinute(this.transaction.timeOfTransaction)
  }

  
  public set timeOfTransaction(v : string) {
    if(!v) return
    this.transaction.timeOfTransaction = dateStringToDate(v);
  }
  
  

  constructor(
    public transactionService: TransactionsService,
    public router:Router,
    public activatedRoute: ActivatedRoute
  ){  }

  update(){
    this.transactionService.updateTransaction(
      this.accountId,
      this.id,
      this.transaction
    ).then(a=>{this.router.navigate(['/','transaction','view',this.accountId,this.id])})
    .catch(console.log)
   console.log(this.transaction) 
  }

}
