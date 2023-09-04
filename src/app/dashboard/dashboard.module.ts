import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TransactionsModule } from '../transactions/transactions.module';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    TransactionsModule,
    RouterModule.forChild([
      {path:"dashboard", component:DashboardComponent}
    ])
  ]
})
export class DashboardModule { }
