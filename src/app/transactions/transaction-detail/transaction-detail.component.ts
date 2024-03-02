import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { OrderByDirection, QueryConstraint, orderBy, where } from 'firebase/firestore';
import { Subscription, filter } from 'rxjs';
import { PagedQuery } from 'src/app/interfaces/query.interface';
import { Transaction } from 'src/app/interfaces/transaction.interface';
import { CacheService } from 'src/app/shared/cache.service';
import { TransactionsService } from 'src/app/shared/transactions.service';
import { fireFilterSpliter, getQueryConstraints, toLocalStringUpToMinute } from 'src/app/shared/utils';

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.scss']
})
export class TransactionDetailComponent {

  response: PagedQuery<Transaction> = {
    results: []
  }

  public get transaction():Transaction | undefined{
    if(this.response.results.length==0) return undefined
    return this.response.results[0]
  }

  public accountId:string | undefined
  public id:string | undefined

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private transactions: TransactionsService,
    private cache:CacheService
  ){
      this.resubscribeRouter()
    
  }

  subscription: Subscription | undefined
  private subscribeFun = (params:ParamMap) =>{
    this.id = params.get("id")!!
    this.accountId = params.get("accountId")!!
    this.cache.get<Transaction>(this.id!!)
      .then(r=>this.response.results.push(r))
      .catch(_=>{})

    getQueryConstraints(this.route).then( constraints =>{
      this.loadTransactionData(this.id!!,constraints)
    })
    
  }
    
  

  desubscribeRouter(){
    // this.subscription?.unsubscribe()
  }

  resubscribeRouter(){
    this.subscription = this.route.paramMap.subscribe(this.subscribeFun)
  }
  

  loadTransactionData(id: string, constraints: QueryConstraint[]){
    this.transactions.getTransaction1(this.accountId!!,id,constraints)
    .then( i=>{
      this.response = i
      this.prepareNavigation()
    }
    ).catch(e=>
      console.log(e)
    )
    
  }

  prepareNavigation(){
    if(this.response.nextPage) this.response.nextPage().then(page=>{ 
      this.navigateNext = ()=>{
        this.response = page
        const transaction = page.results[0]
        this.prepareNavigation()
        this.desubscribeRouter()
        this.router.navigate(['..',transaction.id],{relativeTo:this.route,queryParamsHandling:'preserve'})
        this.resubscribeRouter()
      }
    }).catch(_=>this.navigateNext = undefined)
    else  this.navigateNext = undefined

    if(this.response.prevPage) this.response.prevPage().then(page=>{ 
      this.navigatePrevious = ()=>{
        this.response = page
        const transaction = page.results[0]
        this.prepareNavigation()
        this.desubscribeRouter()
        this.router.navigate(['..',transaction.id],{relativeTo:this.route,queryParamsHandling:'preserve'})
        this.resubscribeRouter()
      }
    }).catch(_=>this.navigatePrevious = undefined)
    else this.navigatePrevious = undefined
  }

  navigateNext: (()=>void) | undefined   = undefined

  navigatePrevious: (()=>void) | undefined   = undefined

  delete() {
    this.transactions.deleteTransaction(this.accountId!!,this.id!!)
    .then(t=>{
      this.router.navigate(['/','account-view',this.accountId])
    })
  }
}
