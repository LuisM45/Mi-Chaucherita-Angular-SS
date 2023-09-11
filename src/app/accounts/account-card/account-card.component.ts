import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-account-card',
  templateUrl: './account-card.component.html',
  styleUrls: ['./account-card.component.scss']
})
export class AccountCardComponent {
  @Input() accountId: string = '';
  @Input() accountName: string = '';
  @Input() accountBalance: number = 0;
  @Input() accountType: string = '';
  @Input() lastTransactionReason: string = '';
  @Input() transactionCount: number = 0;
  @Input() imageUrl: string = '';
}