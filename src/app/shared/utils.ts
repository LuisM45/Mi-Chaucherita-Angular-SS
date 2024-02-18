import { ActivatedRoute } from "@angular/router"
import { DocumentSnapshot, OrderByDirection, QueryConstraint, Timestamp, WhereFilterOp, addDoc, orderBy, where } from "firebase/firestore"
import { Transaction } from "../interfaces/transaction.interface"
import { Account } from "../interfaces/accout.interface"
import { PromiseHolder } from "../classes/PromiseHolder.class"
import { Subscription } from "rxjs"
import { EncryptionService } from "./encryption.service"
import { Pailler } from "../classes/cryptography/Pailler.class"


export function toLocalStringUpToMinute(date: Date):string{
    var dateString = date.toISOString()
    var until = dateString.lastIndexOf(':')
    return dateString.substring(0,until)
}

export function dateStringToDate(str: string):Date{
    return new Date(str+'Z')
}

export function fireFilterSpliter(str:string):{field:string,op:WhereFilterOp,value:string}{
    var ops: WhereFilterOp[] = ['==','<=','>=','!=','<', '>', 'not-in','array-contains', 'in', 'array-contains-any',]
    var ret = {field:"",op:ops[0],value:""}
    ops.forEach( op=>{
        var splut = str.split(op,1)
        if(splut.length>1){
            ret.field = splut[0]
            ret.op = op
            ret.value = splut[1]
        }
    })

    return ret

    
}

export function getQueryConstraints(route:ActivatedRoute):Promise<QueryConstraint[]>{
    var qConstr: QueryConstraint[] = []
    var subscription: Subscription
    var promise:Promise<QueryConstraint[]> = new Promise((resolve,reject)=>{

      subscription= route.queryParamMap.subscribe(i=>{
        if(i.has("orderby")){
          var direction: OrderByDirection = "asc"
          if(i.has("reverse")) direction = "desc"
          qConstr.push(orderBy(i.get("orderby")!!,direction))
        }else{
          qConstr.push(orderBy("timeOfTransaction","asc"))
        }
        
        if(i.has("filter")){
          var filters = i.get("filter")!!.split(",") // WARN
          filters.map(s=>fireFilterSpliter(s))
          .forEach(ss=>qConstr.push(where(ss.field,ss.op,ss.value)))
        }

        resolve(qConstr)
      })
    })
    promise.finally(()=>subscription.unsubscribe())
    return promise
  }

  export function parseDocToTransaction(documentSnapshot:DocumentSnapshot):Transaction{
    const data = documentSnapshot.data()
    var value:Transaction = data as Transaction
    value.id = documentSnapshot.id
    value.account = ()=>documentSnapshot.ref
    value.timeOfTransaction = (data!!['timeOfTransaction'] as Timestamp).toDate()
    return value
  }

  export function parseDocToAccount(documentSnapshot:DocumentSnapshot):Account{
    const data = documentSnapshot.data()
    const value: Account = data as Account
    value.id = documentSnapshot.id
    //value.transactions // TODO: Possibly will need to define
    return value
  }

export class DocumentEncryptor{
  constructor(private encryptSvc: EncryptionService){}
  private sencrypt(plaintext:string){return this.encryptSvc.symmetricEncryption(plaintext)}
  private sdecrypt(ciphertext:string){return this.encryptSvc.symmetricDecryption(ciphertext)}
  private hencrypt(plaintext:string){return this.encryptSvc.partialEncryption(plaintext)}
  private hdecrypt(ciphertext:string){return this.encryptSvc.partialDecryption(ciphertext)}

  async cipherdocToTransaction(documentSnapshot:DocumentSnapshot): Promise<Transaction>{
    const data = documentSnapshot.data()!

    return {
      account: ()=>documentSnapshot.ref,
      id: documentSnapshot.id,
      title: await this.sdecrypt(data['title']),
      amount: Number(await this.hdecrypt(data['amount'])),
      timeOfTransaction: (data!!['timeOfTransaction'] as Timestamp).toDate(),
      description: await this.sdecrypt(data['description']),
    }
  }

  async cipherdocToAccount(documentSnapshot:DocumentSnapshot):Promise<Account>{
    const data = documentSnapshot.data()!
    return {
      id: documentSnapshot.id,
      name: await this.sdecrypt(data['name']),
      registerCount: Number(await this.hdecrypt(data['registerCount'])),
      currentValue: Number(await this.hdecrypt(data['currentValue'])),
      type: (await this.sdecrypt(data['type'])) as "income"| "spending" | "income and spending",
  }
  }

  async transactionToCipherobj(transaction: Transaction): Promise<object>{
    var parms = Pailler.create()
    var p = Pailler.create()
    var amount = "notin"
    var camount = await p.encrypt(amount)
    var pamount = await p.decrypt(camount)
    console.log(`amount ${amount}`)
    console.log(`camount ${camount}`)
    console.log(`pamount ${pamount}`)
    return {
      title: await this.sencrypt(transaction.title),
      amount: await this.hencrypt(transaction.amount.toString()),
      timeOfTransaction: transaction.timeOfTransaction,
      description: await this.sencrypt(transaction.description)
    }
  }
  
  async accountToCipherobj(account: Account): Promise<object>{
    return {
      name: await this.sencrypt(account.name),
      registerCount: await this.hencrypt(account.registerCount.toString()),
      currentValue: await this.hencrypt(account.currentValue.toString()),
      type: await this.sencrypt(account.type),
  }
  }
}

  export function toBigPromise<F>(promises:Promise<F>[]):Promise<(F)[]>{
    if(promises.length==0) return Promise.resolve([])

    return new Promise((resolve,reject)=>{
      const resolves:(F|undefined)[] = []
      var pending = promises.length
      promises.forEach((p,i)=>{
        resolves.push(undefined)
        p.then(result=>{
          resolves[i] = result
          pending -= 1
          if(pending==0) resolve(resolves.map(i=>i!!))
        })
      })
    })
  }

  export function flattenPromise<F>(promise:Promise<Promise<F>>):Promise<(F)>{
    return new Promise((resolve,reject)=>{
      promise.then(result1=>{
        result1.then(result2=>resolve(result2))
          .catch(ex2=>reject(ex2))
      })
      .catch(ex1=>reject(ex1))
    })
  }

  export function sanitizeTransaction(transaction:Transaction):Transaction{
    var value:Transaction = {
      title: transaction.title,
      amount: transaction.amount,
      timeOfTransaction: transaction.timeOfTransaction,
      description: transaction.description
    }
    return value
  }

  export function sanitizeAccount(account:Account):Account{
    console.log("update")
    var value:Account = {
      name: account.name,
      registerCount: account.registerCount,
      currentValue: account.currentValue,
      type: account.type,
      id: account.id
    }
    return value
  }

  const d = new Map<string,string>
  d.set("income","Ingreso")
  d.set("spending","Gastos")
  d.set("income and spending","Ingresos y Gastos")
  export function accountTypeToSpanish(type:string):string{
    return d.get(type)!!
  }