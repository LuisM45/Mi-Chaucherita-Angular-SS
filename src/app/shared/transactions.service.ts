import { Injectable, inject } from '@angular/core';
import { PagedQuery } from '../interfaces/query.interface';
import { Transaction } from '../interfaces/transaction.interface';
import { Firestore } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserService } from './user.service';
import { DocumentReference, DocumentSnapshot, QueryConstraint, addDoc, collection, deleteDoc, doc, endBefore, getDoc, getDocs, limit, limitToLast, orderBy, query, setDoc, startAfter, startAt } from 'firebase/firestore';
import { DocumentEncryptor, flattenPromise, parseDocToAccount, sanitizeTransaction, toBigPromise } from './utils';
import { CacheService } from './cache.service';
import { AccountService } from './account.service';
import { PromiseHolder } from '../classes/PromiseHolder.class';
import * as e from 'cors';
import { Account } from '../interfaces/accout.interface';
import { EncryptionService } from './encryption.service';


const PAGE_SIZE = 100
@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  getConextCol(accountRef:DocumentReference){
    return collection(accountRef,"transactions")
  }

  getConextColById(accountId:string){
    return collection(this.accountService.contextCol,accountId,"transactions")
  }

  private documentEncryptor: DocumentEncryptor;
  constructor(
    private accountService: AccountService,
    private userService: UserService,
    private firestore: AngularFirestore,
    private firestoreNew: Firestore = inject(Firestore),
    private cache:CacheService,
    private encSvc:EncryptionService,
    ) { 
      this.documentEncryptor = new DocumentEncryptor(encSvc)

    }

  getTransactions(max: number, filter:any ): PagedQuery<Transaction>{
    // TODO
    max; filter
    return {results:[]}
  }

  getRecentQuery(id:string): PagedQuery<Transaction> | null{
    // TODO
    return null
  }

getTransactionOnly(accountId:string,id:string):Promise<Transaction>{
  const d = doc(this.getConextColById(accountId),id)
  return new PromiseHolder(getDoc(d))
    .pipe(this.documentEncryptor.cipherdocToTransaction)
    .pipeFlat(e=>e)
    .promise
}

getTransaction(accountId:string,id:string):Promise<PagedQuery<Transaction>>{
    return this.getTransaction1(accountId,id,[orderBy("timeOfTransaction","asc")])
}
getTransaction1(accountId:string,id:string,queryConstraints:QueryConstraint[]):Promise<PagedQuery<Transaction>>{
    return new Promise((resolve,reject)=>{
      var document =  doc(this.getConextColById(accountId),id)
      getDoc(document)
      .then(docSnap=>{
        this.getTransaction2(docSnap,queryConstraints)
        .then(tr => resolve(tr))
        .catch(e=>reject(e))
      })
      .catch(e=>reject(e))
    })
}



async getTransaction2(snapshot:DocumentSnapshot,queryConstraints:QueryConstraint[]):Promise<PagedQuery<Transaction>>{
  var transaction = await this.documentEncryptor.cipherdocToTransaction(snapshot)
  this.cache.set(snapshot.id,transaction)
  var result:PagedQuery<Transaction> = {
    results: [{id:snapshot.id, data:transaction}],
    nextPage: ()=>this.lambdaNextTransaction(snapshot,queryConstraints,()=>result),
    prevPage: ()=>this.lambdaPrevTransaction(snapshot,queryConstraints,()=>result)
  }
  


  return Promise.resolve(result)
}

private async  lambdaNextTransaction(snapshot:DocumentSnapshot,queryConstraints:QueryConstraint[],oldResults:()=>PagedQuery<Transaction>):Promise<PagedQuery<Transaction>>{
  var q = query(snapshot.ref.parent,...queryConstraints,limit(1),startAfter(snapshot))

  return new Promise((resolve,reject)=>{
    getDocs(q)
    .then(async docs=>{
      if(docs.size==0) {reject();return}
      const _doc = docs.docs[0]

      var transaction = await this.documentEncryptor.cipherdocToTransaction(_doc)
      this.cache.set(_doc.id,transaction)
      var result:PagedQuery<Transaction> = {
        results: [{id:_doc.id, data:transaction}],
        prevPage: ()=>Promise.resolve(oldResults()),
      }
      this.cache.set(_doc.id,transaction)
      result.nextPage = ()=>this.lambdaNextTransaction(_doc,queryConstraints,()=>result)
      resolve(result)
    }).catch(e=>
      reject(e)
    )
  })
}

private async lambdaPrevTransaction(snapshot:DocumentSnapshot,queryConstraints:QueryConstraint[],oldResults:()=>PagedQuery<Transaction>):Promise<PagedQuery<Transaction>>{
  var q = query(snapshot.ref.parent,...queryConstraints,limitToLast(1),endBefore(snapshot))

  return new Promise((resolve,reject)=>{
    getDocs(q)
    .then(async docs=>{
      if(docs.size==0) {reject();return}
      const _doc = docs.docs[0]
      var transaction = await this.documentEncryptor.cipherdocToTransaction(_doc)
      this.cache.set(_doc.id,transaction)
      var result:PagedQuery<Transaction> = {
        results: [{id:_doc.id, data:transaction}],
        nextPage: ()=>Promise.resolve(oldResults()),
      }
      result.prevPage = ()=>this.lambdaPrevTransaction(_doc,queryConstraints,()=>result)

      result.results = await toBigPromise(docs.docs.map(async d=>{return{id:d.id,data: await this.documentEncryptor.cipherdocToTransaction(d)}}))
      resolve(result)
    }).catch(e=>
      reject(e)
    )
  })
}

getAllTransactionList():Promise<PagedQuery<Transaction>>{
  return this.getAllTransactionList1([])
}

getAllTransactionList1(queryConstraints:QueryConstraint[]):Promise<PagedQuery<Transaction>>{
  return new PromiseHolder(this.accountService.getAllAccounts())
    .pipe(e=>e.map(i=>i.id!!))
    .pipe(accountIds=>accountIds.map(i=>this.getTransactionList1(i,queryConstraints)))
    .pipeFlat(toBigPromise)
    .pipe(queries=>queries.map(e=>e.results))
    .pipe(e=>Array.prototype.concat(...e))
    .pipe(r=>{return{results: r}})
    .promise
}

getTransactionList(accountId:string):Promise<PagedQuery<Transaction>>{
  return this.getTransactionList1(accountId,[orderBy("timeOfTransaction","asc"),limit(PAGE_SIZE)])
}

getTransactionList1a(accountId:string,startId:string,endId:string,queryConstraints:QueryConstraint[]):Promise<PagedQuery<Transaction>>{
  if(this.userService.currentUser?.uid==null) return Promise.reject()
  var col = this.getConextColById(accountId)
  var docStart = doc(col,startId)
  var docEnd = doc(col,endId)

  return new Promise((resolve,reject)=>{
    getDoc(docStart).then(snapStart =>{
      getDoc(docEnd).then(snapEnd=>{
      this.getTransactionList2(snapStart,snapEnd,queryConstraints)
        .then(r=>resolve(r))
        .catch(e=>reject(e))
      }).catch(e=>reject(e))}).catch(e=>reject(e))
  })
  
}


getTransactionList1(accountId:string,queryConstraints:QueryConstraint[]):Promise<PagedQuery<Transaction>>{
  return new Promise((resolve,reject)=>{
    getDocs(this.getConextColById(accountId)).then(async docs=>{
      const firstDoc = docs.docs[0]
      const lastDoc = docs.docs[docs.size-1]
      if(docs.size == 0) {reject();return}
      var result: PagedQuery<Transaction> ={
        results: await toBigPromise(docs.docs.map(async d=>{return {id:d.id, data: await this.documentEncryptor.cipherdocToTransaction(d)}})),
        prevPage: ()=>this.getPrevTransactionListPromise(firstDoc,queryConstraints,()=>result),
        nextPage: ()=>this.getNextTransactionListPromise(lastDoc,queryConstraints,()=>result)
      }
      resolve(result)
    }).catch(e=>{reject(e)})
  })
}


getTransactionList2(firstSnapshot:DocumentSnapshot,lastSnapshot:DocumentSnapshot,queryConstraints:QueryConstraint[]):Promise<PagedQuery<Transaction>>{
var q = query(lastSnapshot.ref.parent,...queryConstraints,startAfter(firstSnapshot),endBefore(lastSnapshot))

return new Promise((resolve,reject)=>{
  getDocs(q).then(async docs=>{
    const firstDoc = docs.docs[0]
        const lastDoc = docs.docs[docs.size-1]
        if(docs.size == 0) {reject();return}
        var result: PagedQuery<Transaction> ={
          results: await toBigPromise(docs.docs.map(async d=>{return {id:d.id, data: await this.documentEncryptor.cipherdocToTransaction(d)}})),
          prevPage: ()=>this.getPrevTransactionListPromise(firstDoc,queryConstraints,()=>result),
          nextPage: ()=>this.getNextTransactionListPromise(lastDoc,queryConstraints,()=>result)
        }
        resolve(result)
    })
  })
}

getNextTransactionListPromise(lastSnapshot:DocumentSnapshot,queryConstraints:QueryConstraint[],oldResults:()=>PagedQuery<Transaction>):Promise<PagedQuery<Transaction>>{
var q = query(lastSnapshot.ref.parent,...queryConstraints,startAfter(lastSnapshot),limit(PAGE_SIZE))

  return new Promise((resolve,reject)=>{
    getDocs(q).then(async docs=>{ 
      const lastDoc = docs.docs[docs.size-1]
      if(docs.size == 0) {reject();return}
      var result: PagedQuery<Transaction> ={
        results: await toBigPromise(docs.docs.map(async d=>{return {id:d.id, data: await this.documentEncryptor.cipherdocToTransaction(d)}})),
        prevPage: ()=>Promise.resolve(oldResults()),
        nextPage: ()=>this.getNextTransactionListPromise(lastDoc,queryConstraints,()=>result)
      }
      resolve(result)
    })
  })
}

getPrevTransactionListPromise(firstSnapshot:DocumentSnapshot,queryConstraints:QueryConstraint[],oldResults:()=>PagedQuery<Transaction>):Promise<PagedQuery<Transaction>>{
  var q = query(firstSnapshot.ref.parent,...queryConstraints,endBefore(firstSnapshot),limitToLast(PAGE_SIZE))

  return new Promise((resolve,reject)=>{
    getDocs(q).then(async docs=>{
      const firstDoc = docs.docs[0]
      if(docs.size == 0) {reject();return}
      var result: PagedQuery<Transaction> ={
        results: await toBigPromise(docs.docs.map(async d=>{return {id:d.id, data: await this.documentEncryptor.cipherdocToTransaction(d)}})),
        nextPage: ()=>Promise.resolve(oldResults()),
        prevPage: ()=>this.getPrevTransactionListPromise(firstDoc,queryConstraints,()=>result)
      }
      resolve(result)
    })
  })
}

  async getLastTransaction(accountId:string):Promise<Transaction | null>{
    const q = query(this.getConextColById(accountId),orderBy("timeOfTransaction","desc"),limit(1))

    return await new PromiseHolder(getDocs(q))
      .pipe(async result=>{
        if(result.size==0) return null
        else return await this.documentEncryptor.cipherdocToTransaction(result.docs[0])
      }).promise
  }

  updateTransaction(accountId:string,id:string,transaction: Transaction):Promise<Transaction>{
    const d = doc(this.getConextColById(accountId),id)

    return new PromiseHolder(this.getTransactionOnly(accountId,id))
      .peek(async _=>setDoc(d,await this.documentEncryptor.transactionToCipherobj(transaction)))
      .joinPromise(this.accountService.getAccount(accountId))
      .pipe(results=>{
        const delta = transaction.amount - results.first.amount
        results.latter.currentValue += delta
        return results.latter
      })
      .peek(t=>{this.accountService.updateAccountAsWhole(t)})
      .pipe(_=>transaction)
      .promise
  }


  deleteTransaction(accountId:string,id:string):Promise<void>{
    const d = doc(this.getConextColById(accountId),id)
    return new PromiseHolder(this.getTransactionOnly(accountId,id))
      .joinPromise(this.accountService.getAccount(accountId))
      .pipe(results=>{
        results.latter.registerCount -= 1
        results.latter.currentValue -= results.first.amount
        return results.latter
      })
      .peek(t=>{this.accountService.updateAccountAsWhole(t)})
      .pipeFlat(_=>deleteDoc(d))
      .promise
      

}

  async registerTransaction(accountId:string,transaction: Transaction): Promise<DocumentReference>{
    let cryptObj = this.documentEncryptor.transactionToCipherobj(transaction)
    return new PromiseHolder(
        addDoc(this.getConextColById(accountId),await cryptObj)
      )
      .joinPromise(this.accountService.getAccount(accountId))
      .pipe(results=>{
        results.latter.registerCount += 1
        results.latter.currentValue += transaction.amount
        return results
      })
      .peek(r=>this.accountService.updateAccountAsWhole(r.latter))
      .pipe(r=>r.first)
      .promise
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