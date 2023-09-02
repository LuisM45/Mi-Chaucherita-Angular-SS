import { Injectable, inject } from '@angular/core';
import { Query } from '../interfaces/query.interface';
import { Transaction } from '../interfaces/transaction.interface';
// import { Firestore } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  constructor(
    private userService: UserService,
    private firestore: AngularFirestore
    ) { }

  recentTransactions: Map<string,Query<Transaction>> = new Map()

  getTransactions(max: number, filter:any ): Query<Transaction>{
    // TODO
    max; filter
    return {id:"",result:[]}
  }

  getRecentQuery(id:string): Query<Transaction> | null{
    // TODO
    return null
  }

  registerTransaction(transaction: Transaction): Promise<any>{
    console.log(`userid:${this.userService.currentUser?.uid}`)
    if(this.userService.currentUser?.uid==null) return Promise.reject()
    const uid = this.userService.currentUser.uid!!

    return new Promise((resolve,reject)=>{
    this.firestore.collection(`transactions`).doc(uid)
      .collection("transactions")
      .add(transaction)
      .then(
        e=>resolve(e),
        e=>reject(e))
  })}

  getEarnings(queryTransaction: Query<Transaction>): number{
    // TODO
    return 0
  }

  getSpendings(queryTransaction: Query<Transaction>): number{
    // TODO
    return 0
  }

  getBalance(queryTransaction: Query<Transaction>): number{
    // TODO
    return 0
  }

}
