import { Component, OnInit } from '@angular/core';
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

export class DashboardComponent implements OnInit{

  _accountTypeToSpanish=accountTypeToSpanish
  accounts: Promise<Account>[] = [];
  balance: number = 0
  spendings: number = 0
  earnings: number = 0
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
    const accum = [0,0,0]
    this.accounts.forEach(
      aP=>aP.then(ac =>{
        const delta = this.addAccount(ac)
        for(var i =0;i<2;i++) accum[i] += delta[i]
        this.earnings = accum[0]
        this.spendings = accum[1]
        this.balance = accum[0] - accum[1]
      })
    )
  }

  private addAccount(account:Account):[number,number]{
    // Esto esta to' feo por el orden de llamadas interno
    switch(account.type){
      case 'income':
        return [ account.currentValue, 0]
      case 'spending':
        return [0,account.currentValue]
      case 'income and spending':
        if(account.currentValue>0){
          return [account.currentValue,0]
        }
        else{
          return [0,account.currentValue]
        }
      }
  }
  
  

  logout() {
    console.log("logout attempted")
    this.userService.logout()
    this.router.navigate(["login"])
  }
}
