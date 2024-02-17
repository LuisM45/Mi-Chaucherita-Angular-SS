import { Injectable, inject } from '@angular/core';
import { UserService } from './user.service';
import { Firestore } from '@angular/fire/firestore';
import { DocumentReference, addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc } from '@firebase/firestore';
import { DocumentData } from '@firebase/firestore-types';
import { Account } from '../interfaces/accout.interface';
import { PromiseHolder } from '../classes/PromiseHolder.class';
import { DocumentEncryptor, parseDocToAccount, sanitizeAccount, toBigPromise } from './utils';
import { Transaction } from '../interfaces/transaction.interface';
import { TransactionsService } from './transactions.service';
import { EncryptionService } from './encryption.service';

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
  
  get contextCol(){
    return this._contextCol
  }
  
  private _contextCol
  private documentEncryptor: DocumentEncryptor;
  constructor(
    private userService:UserService,
    private firestoreNew: Firestore = inject(Firestore),
    private encSvc:EncryptionService,
    ) {
      this.documentEncryptor = new DocumentEncryptor(encSvc)
      this._contextCol = collection(this.firestoreNew,"transactions",this.userService.currentUser?.uid!!,"account")
    }

  async createAccount(account:Account):Promise<string>{
    return new PromiseHolder(addDoc(this.contextCol,await this.documentEncryptor.accountToCipherobj(account)))
      .pipe( docSnap=> docSnap.id)
      .promise
  }

  async getAllAccounts():Promise<Account[]> {
      return new PromiseHolder(getDocs(this.contextCol))
        .pipe( snapshot=>  toBigPromise(snapshot.docs.map(async a=>await this.documentEncryptor.cipherdocToAccount(a))))
        .promise
  }

  async getAccount(id:string):Promise<Account> {
    const document = doc(this.contextCol,id)
    return new PromiseHolder(getDoc(document))
      .pipe(async a=> await this.documentEncryptor.cipherdocToAccount(a))
      .promise
  }

  async updateAccountAsWhole(account:Account):Promise<Account> {    
    const _account = {...account}
    
    return this.updateAccount(_account.id!!, _account)
  
  }

  async updateAccount(id:string,account:Account):Promise<Account> {
    const document = doc(this.contextCol,id)

    return new PromiseHolder(setDoc(document,await this.documentEncryptor.accountToCipherobj(account)))
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