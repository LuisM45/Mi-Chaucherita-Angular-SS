import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private accounts = [
    {
      id: 1,
      name: 'Nomina',
      balance: +5000,
      type: 'Ingreso',
      lastTransactionReason: 'Salario',
      transactionCount: 5,
      imageUrl: 'assets/cuenta.jpg'
    },
    {
      id: 2,
      name: 'Universidad',
      balance: -1000,
      type: 'Egreso',
      lastTransactionReason: 'Compra',
      transactionCount: 10,
      imageUrl: 'assets/cuenta.jpg'
    },


    // Agrega más cuentas aquí...
  ];

  constructor() { }

  getAllAccounts() {
    return this.accounts;
  }

  getAccountDetails(accountId: number) {
    // Busca la cuenta por id en el arreglo de cuentas
    return this.accounts.find(acc => acc.id === +accountId);
  }
}