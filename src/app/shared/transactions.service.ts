import { Injectable, inject } from '@angular/core';
import { PagedQuery } from '../interfaces/query.interface';
import { Transaction } from '../interfaces/transaction.interface';
import { Firestore } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserService } from './user.service';
import { DocumentReference, DocumentSnapshot, QueryConstraint, addDoc, collection, deleteDoc, doc, endBefore, getDoc, getDocs, limit, limitToLast, orderBy, query, setDoc, startAfter, startAt } from 'firebase/firestore';
import { parseDocToTransaction } from './utils';
import { CacheService } from './cache.service';


const PAGE_SIZE = 3
@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  constructor(
    private userService: UserService,
    private firestore: AngularFirestore,
    private firestoreNew: Firestore = inject(Firestore),
    private cache:CacheService
    ) { }

  getTransactions(max: number, filter:any ): PagedQuery<Transaction>{
    // TODO
    max; filter
    return {results:[]}
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
  var transaction = parseDocToTransaction(snapshot)
  this.cache.set(snapshot.id,transaction)
  var result:PagedQuery<Transaction> = {
    results: [{id:snapshot.id, data:transaction}],
    nextPage: ()=>this.lambdaNextTransaction(snapshot,queryConstraints,()=>result),
    prevPage: ()=>this.lambdaPrevTransaction(snapshot,queryConstraints,()=>result)
  }
  


  return Promise.resolve(result)
}
private lambdaNextTransaction(snapshot:DocumentSnapshot,queryConstraints:QueryConstraint[],oldResults:()=>PagedQuery<Transaction>):Promise<PagedQuery<Transaction>>{
  var q = query(snapshot.ref.parent,...queryConstraints,limit(1),startAfter(snapshot))

  return new Promise((resolve,reject)=>{
    getDocs(q)
    .then(docs=>{
      if(docs.size==0) {reject();return}
      const _doc = docs.docs[0]

      var transaction = parseDocToTransaction(_doc)
      this.cache.set(_doc.id,transaction)
      var result:PagedQuery<Transaction> = {
        results: [{id:_doc.id, data:transaction}],
        prevPage: ()=>Promise.resolve(oldResults()),
      }
      this.cache.set(_doc.id,transaction)
      result.nextPage = ()=>this.lambdaNextTransaction(_doc,queryConstraints,()=>result)
      resolve(result)
    }).catch(e=>
      console.log(e)
    )
  })
}

private lambdaPrevTransaction(snapshot:DocumentSnapshot,queryConstraints:QueryConstraint[],oldResults:()=>PagedQuery<Transaction>):Promise<PagedQuery<Transaction>>{
  var q = query(snapshot.ref.parent,...queryConstraints,limitToLast(1),endBefore(snapshot))

  return new Promise((resolve,reject)=>{
    getDocs(q)
    .then(docs=>{
      if(docs.size==0) {reject();return}
      const _doc = docs.docs[0]
      var transaction = parseDocToTransaction(_doc)
      this.cache.set(_doc.id,transaction)
      var result:PagedQuery<Transaction> = {
        results: [{id:_doc.id, data:transaction}],
        nextPage: ()=>Promise.resolve(oldResults()),
      }
      result.prevPage = ()=>this.lambdaPrevTransaction(_doc,queryConstraints,()=>result)

      result.results = docs.docs.map(d=>{return{id:d.id,data:parseDocToTransaction(d)}})
      resolve(result)
    }).catch(e=>
      console.log(e)
    )
  })
}

getTransactionList():Promise<PagedQuery<Transaction>>{
  console.log("getTransactionList")
  return this.getTransactionList1([orderBy("timeOfTransaction","asc"),limit(PAGE_SIZE)])
}

getTransactionList1a(startId:string,endId:string,queryConstraints:QueryConstraint[]):Promise<PagedQuery<Transaction>>{
  console.log("getTransaction1a")
  if(this.userService.currentUser?.uid==null) return Promise.reject()
  const uid = this.userService.currentUser.uid!!
  var docStart = doc(this.firestoreNew,`transactions`,uid,'transactions',startId)
  var docEnd = doc(this.firestoreNew,`transactions`,uid,'transactions',endId)

  return new Promise((resolve,reject)=>{
    getDoc(docStart).then(snapStart =>{
      getDoc(docEnd).then(snapEnd=>{
      this.getTransactionList2(snapStart,snapEnd,queryConstraints)
        .then(r=>resolve(r))
        .catch(e=>reject(e))
      }).catch(e=>reject(e))}).catch(e=>reject(e))
  })
  
}

getTransactionList1(queryConstraints:QueryConstraint[]):Promise<PagedQuery<Transaction>>{
  console.log("getTransactionList1")
  if(this.userService.currentUser?.uid==null) return Promise.reject()
  const uid = this.userService.currentUser.uid!!
  var col = collection(this.firestoreNew,`transactions`,uid,'transactions')
  var q = query(col,...queryConstraints,limit(PAGE_SIZE))

  return new Promise((resolve,reject)=>{
    getDocs(q).then(docs=>{
      const firstDoc = docs.docs[0]
      const lastDoc = docs.docs[docs.size-1]
      if(docs.size == 0) {reject();return}
      var result: PagedQuery<Transaction> ={
        results: docs.docs.map(d=>{return {id:d.id, data:parseDocToTransaction(d)}}),
        prevPage: ()=>this.getPrevTransactionListPromise(firstDoc,queryConstraints,()=>result),
        nextPage: ()=>this.getNextTransactionListPromise(lastDoc,queryConstraints,()=>result)
      }
      resolve(result)
    }).catch(e=>{reject(e)})
  })
}


getTransactionList2(firstSnapshot:DocumentSnapshot,lastSnapshot:DocumentSnapshot,queryConstraints:QueryConstraint[]):Promise<PagedQuery<Transaction>>{
console.log("getTransaction2")
var q = query(lastSnapshot.ref.parent,...queryConstraints,startAfter(firstSnapshot),endBefore(lastSnapshot))

return new Promise((resolve,reject)=>{
  getDocs(q).then(docs=>{
    const firstDoc = docs.docs[0]
        const lastDoc = docs.docs[docs.size-1]
        if(docs.size == 0) {reject();return}
        var result: PagedQuery<Transaction> ={
          results: docs.docs.map(d=>{return {id:d.id, data:parseDocToTransaction(d)}}),
          prevPage: ()=>this.getPrevTransactionListPromise(firstDoc,queryConstraints,()=>result),
          nextPage: ()=>this.getNextTransactionListPromise(lastDoc,queryConstraints,()=>result)
        }
        resolve(result)
    })
  })
}

getNextTransactionListPromise(lastSnapshot:DocumentSnapshot,queryConstraints:QueryConstraint[],oldResults:()=>PagedQuery<Transaction>):Promise<PagedQuery<Transaction>>{
console.log("getNextTransactionListPromise")
var q = query(lastSnapshot.ref.parent,...queryConstraints,startAfter(lastSnapshot),limit(PAGE_SIZE))

  return new Promise((resolve,reject)=>{
    getDocs(q).then(docs=>{ 
      const lastDoc = docs.docs[docs.size-1]
      if(docs.size == 0) {reject();return}
      var result: PagedQuery<Transaction> ={
        results: docs.docs.map(d=>{return {id:d.id, data:parseDocToTransaction(d)}}),
        prevPage: ()=>Promise.resolve(oldResults()),
        nextPage: ()=>this.getNextTransactionListPromise(lastDoc,queryConstraints,()=>result)
      }
      resolve(result)
    })
  })
}

getPrevTransactionListPromise(firstSnapshot:DocumentSnapshot,queryConstraints:QueryConstraint[],oldResults:()=>PagedQuery<Transaction>):Promise<PagedQuery<Transaction>>{
  console.log("getPrevTransactionListPromise")
  var q = query(firstSnapshot.ref.parent,...queryConstraints,endBefore(firstSnapshot),limitToLast(PAGE_SIZE))

  return new Promise((resolve,reject)=>{
    getDocs(q).then(docs=>{
      const firstDoc = docs.docs[0]
      if(docs.size == 0) {reject();return}
      var result: PagedQuery<Transaction> ={
        results: docs.docs.map(d=>{return {id:d.id, data:parseDocToTransaction(d)}}),
        nextPage: ()=>Promise.resolve(oldResults()),
        prevPage: ()=>this.getPrevTransactionListPromise(firstDoc,queryConstraints,()=>result)
      }
      resolve(result)
    })
  })
}

  updateTransaction(id:string,transaction: Transaction):Promise<void>{
    if(this.userService.currentUser?.uid==null) return Promise.reject()
    const uid = this.userService.currentUser.uid!!
    const d = doc(this.firestoreNew,"transactions",uid,"transactions",id)
    return setDoc(d,transaction)
  }


  deleteTransaction(id:string):Promise<void>{
    if(this.userService.currentUser?.uid==null) return Promise.reject()
    const uid = this.userService.currentUser.uid!!
    const d = doc(this.firestoreNew,"transactions",uid,"transactions",id)
    return deleteDoc(d)
}

  registerTransaction(transaction: Transaction): Promise<DocumentReference>{
    if(this.userService.currentUser?.uid==null) return Promise.reject()
    const uid = this.userService.currentUser.uid!!
    const col = collection(this.firestoreNew,"transactions",uid,"transactions")

    return addDoc(col,transaction)
}

  getEarnings(queryTransaction: PagedQuery<Transaction>): number{
    if(queryTransaction.results.length==0) return 0
    return queryTransaction.results
      .map(t=>t.data.amount)
      .filter(a=>a>0)
      .reduce((p,c)=>p+c,0)
  }

  getSpendings(queryTransaction: PagedQuery<Transaction>): number{
    if(queryTransaction.results.length==0) return 0
    return queryTransaction.results
    .map(t=>t.data.amount)
    .filter(a=>a<0)
    .reduce((p,c)=>p+c,0)
  }

  getBalance(queryTransaction: PagedQuery<Transaction>): number{
    if(queryTransaction.results.length==0) return 0
    return queryTransaction.results
      .map(t=>t.data.amount)
      .reduce((p,c)=>p+c,0)
  }

}
// getTransactions(queryConstraints:QueryConstraint[]):PagedQuery<Transaction>{}