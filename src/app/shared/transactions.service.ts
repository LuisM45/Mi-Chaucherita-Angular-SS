import { Injectable, inject } from '@angular/core';
import { PagedQuery } from '../interfaces/query.interface';
import { Transaction } from '../interfaces/transaction.interface';
import { Firestore } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserService } from './user.service';
import { DocumentReference, DocumentSnapshot, QueryConstraint, collection, doc, endBefore, getDoc, getDocs, limit, limitToLast, orderBy, query, startAfter, startAt } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  constructor(
    private userService: UserService,
    private firestore: AngularFirestore,
    private firestoreNew: Firestore = inject(Firestore)
    ) { }

  getTransactions(max: number, filter:any ): PagedQuery<Transaction>{
    // TODO
    max; filter
    return {id:"",result:[]}
  }

  getRecentQuery(id:string): PagedQuery<Transaction> | null{
    // TODO
    return null
  }


getTransaction(id:string):Promise<PagedQuery<Transaction>>{
    console.log("getTransaction0")
    return this.getTransaction1(id,[orderBy("timeOfTransaction","asc")])
}
getTransaction1(id:string,queryConstraints:QueryConstraint[]):Promise<PagedQuery<Transaction>>{
  console.log("getTransaction1")
  if(this.userService.currentUser?.uid==null) return Promise.reject()
  const uid = this.userService.currentUser.uid!!
  console.log("getTransaction1:a")
  

    return new Promise((resolve,reject)=>{
      var document = doc(this.firestoreNew,`transactions`,uid,'transactions',id)
      getDoc(document)
      .then(docSnap=>{
        this.getTransaction2(docSnap,queryConstraints)
        .then(tr => resolve(tr))
        .catch(e=>reject(e))
      })
      .catch(e=>reject(e))
    })
}



getTransaction2(snapshot:DocumentSnapshot,queryConstraints:QueryConstraint[]):Promise<PagedQuery<Transaction>>{
  console.log("getTransaction2")
  var result:PagedQuery<Transaction> = {
    id: snapshot.id,
    result: [snapshot.data() as Transaction]
  }

  var nextPromise = this.lambdaNextTransaction(snapshot,queryConstraints).then(r=>result.nextPage=r)
  var prevPromise = this.lambdaPrevTransaction(snapshot,queryConstraints).then(r=>result.prevPage=r)

  return new Promise((resolve,reject)=>{
    Promise.allSettled([nextPromise,prevPromise]).then(_=>
      resolve(result)
    )
  })
}
private lambdaNextTransaction(snapshot:DocumentSnapshot,queryConstraints:QueryConstraint[]):Promise<()=>Promise<PagedQuery<Transaction>>>{
  var q = query(snapshot.ref.parent,...queryConstraints,limit(1),startAfter(snapshot))

  return new Promise((resolve,reject)=>{
    getDocs(q)
    .then(docs=>{
      if(docs.size==0) {reject();return}
      var _doc = docs.docs[0]
      resolve(()=>this.getTransaction2(_doc,queryConstraints))
    })
  })
}

private lambdaPrevTransaction(snapshot:DocumentSnapshot,queryConstraints:QueryConstraint[]):Promise<()=>Promise<PagedQuery<Transaction>>>{
  var q = query(snapshot.ref.parent,...queryConstraints,limitToLast(1),endBefore(snapshot))

  return new Promise((resolve,reject)=>{
    getDocs(q)
    .then(docs=>{
      if(docs.size==0) {reject();return}
      var _doc = docs.docs[0]
      resolve(()=>this.getTransaction2(_doc,queryConstraints))
    })
  })
}
// getNextTransaction(snapshot,queryConstraints:QueryConstraint[]):PagedQuery<Transaction>{}
// getPreviousTransaction(snapshot,queryConstraints:QueryConstraint[]):PagedQuery<Transaction>{}

// getTransactions(queryConstraints:QueryConstraint[]):PagedQuery<Transaction>{}


  // getTransaction(id:string): Promise<PagedQuery<Transaction>>{
  //   if(this.userService.currentUser?.uid==null) return Promise.reject()
  //   const uid = this.userService.currentUser.uid!!

  //   var result:PagedQuery<Transaction> = {
  //     id: '',
  //     result: []
  //   }

  //   return new Promise((resolve,reject)=>{
  //   var document = doc(this.firestoreNew,`transactions`,uid,'transactions',id)
  //     getDoc(document).then(d=>{
  //       if(!d.exists()) reject()
  //       else{
  //         result.id = d.id
  //         result.result = [d.data() as Transaction]

  //         var prevPromise = this.getPreviousTransactionId(d).then(i=>result.previousId=i)
  //         var nextPromies = this.getNextTransactionId(d).then(i=>result.nextId=i)
  //         Promise.allSettled([prevPromise,nextPromies]).then(_=>resolve(result))
  //       }
  //     })
  //   })

  // }


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

  getEarnings(queryTransaction: PagedQuery<Transaction>): number{
    // TODO
    return 0
  }

  getSpendings(queryTransaction: PagedQuery<Transaction>): number{
    // TODO
    return 0
  }

  getBalance(queryTransaction: PagedQuery<Transaction>): number{
    // TODO
    return 0
  }

}
// getTransactions(queryConstraints:QueryConstraint[]):PagedQuery<Transaction>{}