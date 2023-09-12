import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { where } from 'firebase/firestore';
import { PromiseHolder } from 'src/app/classes/PromiseHolder.class';
import { Account } from 'src/app/interfaces/accout.interface';
import { AccountService } from 'src/app/shared/account.service';
import { TransactionsService } from 'src/app/shared/transactions.service';
import { UserService } from 'src/app/shared/user.service';
import { accountTypeToSpanish } from 'src/app/shared/utils';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent {

  _accountTypeToSpanish=accountTypeToSpanish
  accounts?: Account[];
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
   this.accountService.getAllAccounts().then(e=>this.accounts=e)
  }


  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleAside() {
    this.isAsideOpen = !this.isAsideOpen;
  }

  loadBalances() {
    new PromiseHolder(this.accountService.getAllAccounts())
      .peek(acounts=>{
        this.earnings = acounts.filter(a=>a.type=="income").map(a=>a.currentValue).reduce((p,c)=>p+c,0)
        this.spendings = acounts.filter(a=>a.type=="spending").map(a=>a.currentValue).reduce((p,c)=>p+c,0)
        this.balance = acounts.map(a=>a.currentValue).reduce((p,c)=>p+c,0)
      })

  }

  logout() {
    console.log("logout attempted")
    this.userService.logout()
    this.router.navigate(["login"])
  }
}
