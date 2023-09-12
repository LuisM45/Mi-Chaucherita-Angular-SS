import { Component, Input, OnInit } from '@angular/core';
import { AccountService } from 'src/app/shared/account.service';
import { TransactionsService } from 'src/app/shared/transactions.service';
import { accountTypeToSpanish } from 'src/app/shared/utils';

@Component({
  selector: 'app-account-card',
  templateUrl: './account-card.component.html',
  styleUrls: ['./account-card.component.scss']
})
export class AccountCardComponent implements OnInit{
  @Input() accountId: string = '';
  @Input() accountName: string = '';
  @Input() accountType: string = '';
  @Input() accountBalance: number = 0;
  lastTransactionReason: string = '';
  @Input() transactionCount: number = 0;
  @Input() imageUrl: string = '';

  _accountTypeToSpanish = accountTypeToSpanish
  constructor(
    private transactionSvc: TransactionsService
  ){}

  ngOnInit(): void {
    this.transactionSvc.getLastTransaction(this.accountId).then(lastTransaction=>{
      if(!lastTransaction) return
      this.lastTransactionReason = lastTransaction.title
    })
  }
}