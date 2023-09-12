import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { QueryConstraint } from 'firebase/firestore';
import { PagedQuery } from 'src/app/interfaces/query.interface';
import { Transaction } from 'src/app/interfaces/transaction.interface';
import { CacheService } from 'src/app/shared/cache.service';
import { TransactionsService } from 'src/app/shared/transactions.service';

@Component({
  selector: 'app-transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['./transaction-table.component.scss']
})
export class TransactionTableComponent {
  filterId = ""

constructor(
  private transactionService: TransactionsService,
  private cache: CacheService,
  private router: Router
){
}
}
