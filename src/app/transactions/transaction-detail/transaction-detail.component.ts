import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderByDirection, QueryConstraint, orderBy, where } from 'firebase/firestore';
import { filter } from 'rxjs';
import { PagedQuery } from 'src/app/interfaces/query.interface';
import { Transaction } from 'src/app/interfaces/transaction.interface';
import { TransactionsService } from 'src/app/shared/transactions.service';
import { fireFilterSpliter, getQueryConstraints, toLocalStringUpToMinute } from 'src/app/shared/utils';

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.scss']
})
export class TransactionDetailComponent {
  response: PagedQuery<Transaction> = {
    id: '',
    result: []
  }
  transaction: Transaction = {
    title: '',
    amount: 0,
    timeOfTransaction: new Date(),
    description: ''
  }
  hasNext: boolean = false
  hasPrev: boolean = false

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private transactions: TransactionsService
  ){
      
      route.paramMap.subscribe(i=>{
        getQueryConstraints(route).then(c=>{
          this.loadTransactionData(i.get('id')!!,c)
        })
      
    }
    )
    
  }

  

  loadTransactionData(id: string, constraints: QueryConstraint[]){
    this.transactions.getTransaction1(id,constraints)
    .then( i=>{
      console.log("Service response")
      console.log(i)
      this.response = i
      this.transaction = this.response.result[0]
      this.hasNext = i.nextPage != undefined
      this.hasPrev = i.prevPage != undefined
    }
    ).catch(e=>
      console.log(e)
    )
    
  }

  navigateNext(){
    this.response.nextPage!!().then(d=>{
      this.router.navigate(['..',d.id],{relativeTo:this.route,queryParamsHandling:'preserve'})
    })
    
  }

  navigatePrevious(){
    this.response.prevPage!!().then(d=>{
      this.router.navigate(['..',d.id],{relativeTo:this.route,queryParamsHandling:'preserve'})
    })
  }
}
