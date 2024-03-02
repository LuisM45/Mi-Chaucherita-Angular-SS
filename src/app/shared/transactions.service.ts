import { Injectable, inject } from '@angular/core';
import { PagedQuery } from '../interfaces/query.interface';
import { Transaction } from '../interfaces/transaction.interface';
import { Firestore } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserService } from './user.service';
import { DocumentReference, DocumentSnapshot, QueryConstraint, addDoc, collection, deleteDoc, doc, endBefore, getDoc, getDocs, limit, limitToLast, orderBy, query, setDoc, startAfter, startAt } from 'firebase/firestore';
import { flattenPromise, parseDocToAccount, sanitizeTransaction, toBigPromise } from './utils';
import { CacheService } from './cache.service';
import { AccountService } from './account.service';
import { PromiseHolder } from '../classes/PromiseHolder.class';
import * as e from 'cors';
import { Account } from '../interfaces/accout.interface';
import { EncryptionService } from './encryption.service';
import { Globals } from './global';



var ready: Promise<void>
var settle = ()=>{}
ready = new Promise((a,b)=>{settle!=a})

const PAGE_SIZE = 100
@Injectable({
  providedIn: 'root'
})

export class TransactionsService {




  constructor(
    private accountService: AccountService,
    private userService: UserService,
    private firestore: AngularFirestore,
    private firestoreNew: Firestore = inject(Firestore),
    private cache:CacheService,
    private encSvc:EncryptionService,
    ) { 

    }
    getConextCol(accountRef:DocumentReference){
      return collection(accountRef,"transactions")
    }
  
    getConextColById(accountId:string){
      return collection(this.accountService.contextCol,accountId,"transactions")
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

async getTransactionOnly(accountId:string,id:string):Promise<Transaction>{
  const docRef = doc(this.getConextColById(accountId),id)
  const crpytObj = await getDoc(docRef)
  const transaction = this.encSvc.cipherdocToTransaction(crpytObj)
  return transaction
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
  var transaction = await this.encSvc.cipherdocToTransaction(snapshot)
  this.cache.set(snapshot.id,transaction)
  var result:PagedQuery<Transaction> = {
    results: [transaction],
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

      var transaction = await this.encSvc.cipherdocToTransaction(_doc)
      this.cache.set(_doc.id,transaction)
      var result:PagedQuery<Transaction> = {
        results: [transaction],
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
      var transaction = await this.encSvc.cipherdocToTransaction(_doc)
      this.cache.set(_doc.id,transaction)
      var result:PagedQuery<Transaction> = {
        results: [transaction],
        nextPage: ()=>Promise.resolve(oldResults()),
      }
      result.prevPage = ()=>this.lambdaPrevTransaction(_doc,queryConstraints,()=>result)

      result.results = await toBigPromise(docs.docs.map(async d=>await this.encSvc.cipherdocToTransaction(d)))
      resolve(result)
    }).catch(e=>
      reject(e)
    )
  })
}

async getAllAccountsTransactionsList():Promise<Promise<Transaction[]>[]>{
  const accountsIds = (await this.accountService.getAllAccountsIds())
  return accountsIds.map(a=>this.getAllTransactionsOfAccount(a))
}

async getAllTransactionsOfAccount(accountId:string):Promise<Transaction[]>{
  const col = this.getConextColById(accountId)
  const docs = await getDocs(col)

  const transactionsPromises:Promise<Transaction>[] = []
  docs.forEach((d)=>{
    transactionsPromises.push(this.encSvc.cipherdocToTransaction(d))
  })

  return (await Promise.all(transactionsPromises))
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
        results: await toBigPromise(docs.docs.map(async d=> await this.encSvc.cipherdocToTransaction(d))),
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
          results: await toBigPromise(docs.docs.map(async d=>await this.encSvc.cipherdocToTransaction(d))),
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
        results: await toBigPromise(docs.docs.map(async d=>await this.encSvc.cipherdocToTransaction(d))),
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
        results: await toBigPromise(docs.docs.map(async d=> await this.encSvc.cipherdocToTransaction(d))),
        nextPage: ()=>Promise.resolve(oldResults()),
        prevPage: ()=>this.getPrevTransactionListPromise(firstDoc,queryConstraints,()=>result)
      }
      resolve(result)
    })
  })
}

  async getLastTransaction(accountId:string):Promise<Transaction | null>{
    const q = query(this.getConextColById(accountId),orderBy("timeOfTransaction","desc"),limit(1))
    const docs = await getDocs(q)

    if(docs.size==0) return null
    const lastTransaction = this.encSvc.cipherdocToTransaction(docs.docs[0])
    return lastTransaction
  }

  async updateTransaction(accountId:string,id:string,transaction: Transaction):Promise<Transaction>{
    const d = doc(this.getConextColById(accountId),id)

    const oldTransaction = await this.getTransactionOnly(accountId,id)
    setDoc(d,await this.encSvc.transactionToCipherobj(transaction))
    const account = await this.accountService.getAccount(accountId)

    const delta = transaction.amount - oldTransaction.amount
    account.currentValue += delta

    this.accountService.updatePartialAccount(accountId!,{currentValue:account.currentValue})

    return transaction
  }


  async deleteTransaction(accountId:string,id:string):Promise<void>{
    const d = doc(this.getConextColById(accountId),id)
    const accountP = this.accountService.getAccount(accountId)
    const oldTransaction = await this.getTransactionOnly(accountId,id)

    deleteDoc(d)
    const account = await accountP

    account.currentValue -= oldTransaction.amount
    account.currentValue -= 1
    await this.accountService.updatePartialAccount(accountId,{currentValue:account.currentValue,registerCount:account.registerCount})
}

  async registerTransaction(accountId:string,transaction: Transaction): Promise<DocumentReference>{
    let cryptObj = await this.encSvc.transactionToCipherobj(transaction)
    let accountP = this.accountService.getAccount(accountId)

    // No borrar riesgo de Heisenbug
    const account = await accountP
    console.log(account.registerCount)
    account.registerCount += 1
    console.log(account.registerCount)
    console.log(account.currentValue)
    account.currentValue += transaction.amount
    console.log(account.currentValue)
    
    const updateP = this.accountService.updatePartialAccount(accountId,{registerCount:account.registerCount,currentValue:account.currentValue})
    let docRef = addDoc(this.getConextColById(accountId),cryptObj)
    await updateP
    return docRef
}

  // getEarnings(queryTransaction: PagedQuery<Transaction>): number{
  //   if(queryTransaction.results.length==0) return 0
  //   return queryTransaction.results
  //     .map(t=>t.data.amount)
  //     .filter(a=>a>0)
  //     .reduce((p,c)=>p+c,0)
  // }

  // getSpendings(queryTransaction: PagedQuery<Transaction>): number{
  //   if(queryTransaction.results.length==0) return 0
  //   return queryTransaction.results
  //   .map(t=>t.data.amount)
  //   .filter(a=>a<0)
  //   .reduce((p,c)=>p+c,0)
  // }

  // getBalance(queryTransaction: PagedQuery<Transaction>): number{
  //   if(queryTransaction.results.length==0) return 0
  //   return queryTransaction.results
  //     .map(t=>t.data.amount)
  //     .reduce((p,c)=>p+c,0)
  // }

}

// More problemas de inicialización
settle()