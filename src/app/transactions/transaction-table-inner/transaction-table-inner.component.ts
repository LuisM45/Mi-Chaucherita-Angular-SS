import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QueryConstraint, where } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { PromiseHolder } from 'src/app/classes/PromiseHolder.class';
import { Account } from 'src/app/interfaces/accout.interface';
import { PagedQuery } from 'src/app/interfaces/query.interface';
import { Transaction } from 'src/app/interfaces/transaction.interface';
import { AccountService } from 'src/app/shared/account.service';
import { CacheService } from 'src/app/shared/cache.service';
import { TransactionsService } from 'src/app/shared/transactions.service';

@Component({
  selector: 'app-transaction-table-inner',
  templateUrl: './transaction-table-inner.component.html',
  styleUrls: ['./transaction-table-inner.component.scss']
})
export class TransactionTableInnerComponent implements OnInit{
  public get transactionService(): TransactionsService {
    return this._transactionService;
  }
  public set transactionService(value: TransactionsService) {
    this._transactionService = value;
  }

  @Input() accountId: string = ""
  account: Account | undefined

  queryConstraints:QueryConstraint[] = []
  response: Transaction[] = []
  constructor(
    private accountServiec: AccountService,
    private _transactionService: TransactionsService,
    private cache: CacheService,
    private router: Router
  ){}
  async ngOnInit(): Promise<void> {
    if(this.accountId){
      this.account = await this.accountServiec.getAccount(this.accountId)
      this.fetchIdOnly()
    }
    else{this.fetchAll()}
  }

  async fetchAll(){
    const transactionsPs = await this._transactionService.getAllAccountsTransactionsList()
    const transactions:Transaction[] = []
    transactionsPs.forEach(tsP=>tsP.then(ts=>{
      transactions.push(...ts)
      this.response.push(...ts);
    }))

    await Promise.all(transactions)
  }

  async fetchIdOnly(){
    this.response = await this.transactionService.getAllTransactionsOfAccount(this.account!)
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

  reload(){

  }

  viewTransaction(transaction:Transaction){
    this.cache.set(transaction.id!,transaction)
    this.router.navigate(['/','transaction','view',transaction.account!.id!,transaction.id!])
  }

  navigatePrevious() {
    // if(!this.response.prevPage) return
    // this.response.prevPage().then(page=>{
    //   this.response = page
    // })
  }

  navigateNext() {
    // if(!this.response.nextPage) return
    // this.response.nextPage().then(page=>{
    //   this.response = page
    // })
  }
}
