import { Injectable, inject } from '@angular/core';
import { Query } from '../interfaces/query.interface';
import { Transaction } from '../interfaces/transaction.interface';
import { Firestore } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserService } from './user.service';
import { DocumentReference, DocumentSnapshot, collection, doc, endBefore, getDoc, getDocs, limit, limitToLast, orderBy, query, startAfter, startAt } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  constructor(
    private userService: UserService,
    private firestore: AngularFirestore,
    private firestoreNew: Firestore = inject(Firestore)
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


  getTransaction(id:string): Promise<Query<Transaction>>{
    if(this.userService.currentUser?.uid==null) return Promise.reject()
    const uid = this.userService.currentUser.uid!!

    var result:Query<Transaction> = {
      id: '',
      result: []
    }

    return new Promise((resolve,reject)=>{
    var document = doc(this.firestoreNew,`transactions`,uid,'transactions',id)
      getDoc(document).then(d=>{
        if(!d.exists()) reject()
        else{
          result.id = d.id
          result.result = [d.data() as Transaction]

          var prevPromise = this.getPreviousTransactionId(d).then(i=>result.previousId=i)
          var nextPromies = this.getNextTransactionId(d).then(i=>result.nextId=i)
          Promise.allSettled([prevPromise,nextPromies]).then(_=>resolve(result))
        }
      })
    })

  }

  private getPreviousTransactionId(doc:DocumentSnapshot):Promise<string>{
    var q = query(doc.ref.parent,orderBy('timeOfTransaction','asc'),limitToLast(1),endBefore(doc))
    var docs = getDocs(q)

    return new Promise((resolve,reject)=>{
      docs.then(qs=>{
        console.log("prev response")
        console.log(qs.docs.map(i=>i.id))

        if(qs.size==0) reject()
        else{
          resolve(qs.docs[0].id)
      }
      }
        ,e=>reject(e))
    })
  }

  private getNextTransactionId(doc:DocumentSnapshot):Promise<string>{
    var q = query(doc.ref.parent,orderBy('timeOfTransaction','asc'),limit(1),startAfter(doc))
    var docs = getDocs(q)

    return new Promise((resolve,reject)=>{
      docs.then(qs=>{
        if(qs.size==0) reject()
        else{
          console.log("next response")
          console.log(qs)
          resolve(qs.docs[0].id)
      }
      }
        ,e=>reject(e))
    })
  }


  registerTransaction(transaction: Transaction): Promise<any>{
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
