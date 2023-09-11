import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { where } from 'firebase/firestore';
import { AccountService } from 'src/app/shared/account.service';
import { TransactionsService } from 'src/app/shared/transactions.service';
import { UserService } from 'src/app/shared/user.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent {

  accounts?: any[];
  balance?: number = undefined
  spendings?: number = undefined
  earnings?: number = undefined
  isMenuOpen = false;
  isAsideOpen: boolean = false;


  constructor(
    public transactionsService: TransactionsService,
    public userService: UserService,
    public router: Router,
    public accountService: AccountService
  ) {
    this.loadBalances()
    this.loadAccounts()
  }

  loadAccounts() {
    this.accounts = this.accountService.getAllAccounts()
  }


  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleAside() {
    this.isAsideOpen = !this.isAsideOpen;
  }

  loadBalances() {
    var timeConstr = where("timeOfTransaction", ">=", (new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)))
    var querResult = this.transactionsService.getTransactionList1([timeConstr])
    querResult.then(qr => {
      console.log("const response")
      console.log(qr)
      this.balance = this.transactionsService.getBalance(qr)
      this.earnings = this.transactionsService.getEarnings(qr)
      this.spendings = this.transactionsService.getSpendings(qr)
    })

  }

  logout() {
    console.log("logout attempted")
    this.userService.logout()
    this.router.navigate(["login"])
  }
}
