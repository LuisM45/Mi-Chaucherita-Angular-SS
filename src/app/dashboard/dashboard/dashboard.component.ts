import { Component } from '@angular/core';
import { where } from 'firebase/firestore';
import { TransactionsService } from 'src/app/shared/transactions.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent {
  balance?: number = undefined
  spendings?: number = undefined
  earnings?: number = undefined


  constructor(
    public transactionsService: TransactionsService
  ){
    this.loadBalances()
  }

  loadBalances(){
    var timeConstr = where("timeOfTransaction",">=",(new Date(Date.now()-1000*60*60*24*30)))
    var querResult = this.transactionsService.getTransactionList1([timeConstr])
    querResult.then(qr=>{
      console.log("const response")
      console.log(qr)
      this.balance = this.transactionsService.getBalance(qr)
      this.earnings = this.transactionsService.getEarnings(qr)
      this.spendings = this.transactionsService.getSpendings(qr)
    })
    
  }
}
