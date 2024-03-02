import { Component, Input, OnInit } from '@angular/core';
import { Account } from 'src/app/interfaces/accout.interface';
import { AccountService } from 'src/app/shared/account.service';
import { TransactionsService } from 'src/app/shared/transactions.service';
import { accountTypeToSpanish } from 'src/app/shared/utils';

@Component({
  selector: 'app-account-card',
  templateUrl: './account-card.component.html',
  styleUrls: ['./account-card.component.scss']
})
export class AccountCardComponent implements OnInit{
  @Input() account?: Promise<Account>;
  accountId: string = '';
  accountName?: string = '';
  accountType?: string = '';
  accountBalance?: number = 0;
  transactionCount?: number = 0;
  imageUrl: string = '';
  lastTransactionReason: string = '';

  _accountTypeToSpanish = accountTypeToSpanish
  constructor(
    private transactionSvc: TransactionsService
  ){}

  async ngOnInit(): Promise<void> {
    await this.account
    this.accountId = (await this.account)!.id!
    this.accountName = (await this.account)!.name
    this.accountType = accountTypeToSpanish((await this.account)!.type)
    this.accountBalance = (await this.account)!.currentValue
    this.transactionCount = (await this.account)!.registerCount

    this.transactionSvc.getLastTransaction(this.accountId).then(lastTransaction=>{
      if(!lastTransaction) return
      this.lastTransactionReason = lastTransaction.title
    })
  }
}