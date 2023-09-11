import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountCardComponent } from './account-card/account-card.component';
import { RegisterAccountComponent } from './register-account/register-account.component';
import { RouterModule } from '@angular/router';
import { AccountViewComponent } from './account-view/account-view.component';
import { TransactionsModule } from '../transactions/transactions.module';

@NgModule({
  declarations: [
    AccountCardComponent,
    RegisterAccountComponent,
    AccountViewComponent
  ],
  imports: [
    CommonModule,
    TransactionsModule,
    RouterModule.forChild([
      { path: "register-account", component: RegisterAccountComponent },
      { path: "account-view/:accountId", component: AccountViewComponent }
    ])
  ],
  exports: [
    AccountCardComponent
  ]
})
export class AccountsModule { }
