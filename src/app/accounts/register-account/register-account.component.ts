import { Component } from '@angular/core';
import { Router } from '@angular/router';
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

  register() {
    
    const newAccount:Account = {
      name: this.accountName!!,
      type: this.selectedType!! as unknown as "income" | "spending" | "income and spending",
      registerCount: 0,
      currentValue: 0
    }

    this.accountSvc.createAccount(newAccount)
      .then(doc=>this.router.navigate(["/","account-view",doc]))
  }
}
