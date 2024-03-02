import { Injectable, inject } from '@angular/core';
import { UserService } from './user.service';
import { Firestore } from '@angular/fire/firestore';
import { DocumentReference, addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc } from '@firebase/firestore';
import { DocumentData } from '@firebase/firestore-types';
import { Account, NullableAccount } from '../interfaces/accout.interface';
import { PromiseHolder } from '../classes/PromiseHolder.class';
import { parseDocToAccount, sanitizeAccount, toBigPromise } from './utils';
import { Transaction } from '../interfaces/transaction.interface';
import { TransactionsService } from './transactions.service';
import { EncryptionService } from './encryption.service';
import { updateDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private accounts = [
    // TODO:CLEAN
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
  
  get contextCol(){
    return this._contextCol
  }
  
  private _contextCol
  constructor(
    private userService:UserService,
    private firestoreNew: Firestore = inject(Firestore),
    private encSvc:EncryptionService,
    ) {
      this._contextCol = collection(this.firestoreNew,"transactions",this.userService.currentUser?.uid!!,"account")
    }

  async createAccount(account:Account):Promise<string>{
    return new PromiseHolder(addDoc(this.contextCol,await this.encSvc.accountToCipherobj(account)))
      .pipe( docSnap=> docSnap.id)
      .promise
  }

  async getAllAccountsIds():Promise<string[]> {
    const ids:string[] = []
    const docs = await getDocs(this.contextCol)
    docs.forEach((d)=>ids.push(d.id))
    return ids
    
}

  async getAllAccounts():Promise<Promise<Account>[]> {
      const accounts:Promise<Account>[] = []
      const docs = await getDocs(this.contextCol)
      docs.forEach(async (d)=>{
        accounts.push(this.encSvc.cipherdocToAccount(d))
      })
      return accounts
      
  }

  async getAccount(id:string):Promise<Account> {
    const document = doc(this.contextCol,id)
    return new PromiseHolder(getDoc(document))
      .pipe(async a=> await this.encSvc.cipherdocToAccount(a))
      .promise
  }

  async updateAccountAsWhole(account:Account):Promise<Account> {    
    const _account = {...account}
    
    return this.updateAccount(_account.id!!, _account)
  
  }

  async updatePartialAccount(id:string,nAccount:NullableAccount):Promise<void> {
    const document = doc(this.contextCol,id)

    await updateDoc(document,await this.encSvc.nullableAccountToCipherobj(nAccount))
  }

  async updateAccount(id:string,account:Account):Promise<Account> {
    const document = doc(this.contextCol,id)

    return new PromiseHolder(setDoc(document,await this.encSvc.accountToCipherobj(account)))
      .pipe(_=>account)
      .promise
  }

  deleteAccount(id:string):Promise<void> {
    const document = doc(this.contextCol,id)
    return deleteDoc(document)
  }

  getAccountDetails(accountId: string) {
    // Busca la cuenta por id en el arreglo de cuentas
    return this.accounts.find(acc => acc.id === +accountId);
  }
}