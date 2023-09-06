import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TransactionsModule } from '../transactions/transactions.module';
import { RouterModule } from '@angular/router';
import { authGuard } from '../guard/auth.guard';



@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    TransactionsModule,
    RouterModule.forChild([
      {path:"dashboard", component:DashboardComponent, canActivate: [authGuard]}
    ])
  ]
})
export class DashboardModule { }
