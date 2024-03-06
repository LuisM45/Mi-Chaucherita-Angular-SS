import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { where } from 'firebase/firestore';
import { FixedPointDecimal } from 'src/app/classes/FixedPointDecimal.class';
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

export class DashboardComponent implements OnInit{

  _accountTypeToSpanish=accountTypeToSpanish
  accounts: Promise<Account>[] = [];
  balance: string = "0"
  spendings: string = "0"
  earnings: string = "0"
  todate: Date
  isMenuOpen = false;
  isAsideOpen: boolean = false;


  constructor(
    public transactionsService: TransactionsService,
    public userService: UserService,
    public router: Router,
    public accountService: AccountService
  ) {
    this.todate = new Date
  }
  async ngOnInit(): Promise<void> {
    await this.loadAccounts()
    await this.loadBalances()
  }

  async loadAccounts() {
    this.accounts = await this.accountService.getAllAccounts()
  }


  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleAside() {
    this.isAsideOpen = !this.isAsideOpen;
  }

  async loadBalances() {
    const accum = [FixedPointDecimal.valueOf(0n),FixedPointDecimal.valueOf(0n),FixedPointDecimal.valueOf(0n)]
    this.accounts.forEach(
      aP=>aP.then(ac =>{
        const delta = this.addAccount(ac)
        for(var i =0;i<2;i++) accum[i].b += delta[i]
        this.earnings = accum[0].toString()
        this.spendings = accum[1].toString()
        this.balance = FixedPointDecimal.toString(accum[0].b - accum[1].b)
      })
    )
  }

  private addAccount(account:Account):[bigint,bigint]{
    // Esto esta to' feo por el orden de llamadas interno
    switch(account.type){
      case 'income':
        return [ account.currentValue.b, 0n]
      case 'spending':
        return [0n,account.currentValue.b]
      case 'income and spending':
        if(account.currentValue.b>0n){
          return [account.currentValue.b,0n]
        }
        else{
          return [0n,account.currentValue.b]
        }
      }
  }
  
  

  logout() {
    this.userService.logout()
    this.router.navigate(["login"])
  }
}
