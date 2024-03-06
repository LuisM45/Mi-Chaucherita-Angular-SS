import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FixedPointDecimal } from 'src/app/classes/FixedPointDecimal.class';
import { Account } from 'src/app/interfaces/accout.interface';
import { AccountService } from 'src/app/shared/account.service';

@Component({
  selector: 'app-register-account',
  templateUrl: './register-account.component.html',
  styleUrls: ['./register-account.component.scss']
})
export class RegisterAccountComponent {

  intArray = [0,1,2]
  typesAccount = ["income", "spending" , "income and spending"]
  typesAccountLabel = ['Ingreso', 'Egreso', 'Ingreso/Egreso'];
  selectedType?: string; // Tipo de cuenta seleccionado
  accountName?: string; // Nombre de la cuenta

  constructor(
    private router:Router,
    private accountSvc: AccountService
  ) {
    ['Ingreso', 'Egreso', 'Ingreso/Egreso'];
  }

  async register() {
    if(!this.accountName || !this.selectedType){
      throw new Error("Missing parameters")
    }

    const newAccount:Account = {
      name: this.accountName!!,
      type: this.selectedType!! as unknown as "income" | "spending" | "income and spending",
      registerCount: 0n,
      currentValue: FixedPointDecimal.valueOf(0n)
    }

    const docId = await this.accountSvc.createAccount(newAccount)
    this.router.navigate(["/","account-view",docId])
  }
}
