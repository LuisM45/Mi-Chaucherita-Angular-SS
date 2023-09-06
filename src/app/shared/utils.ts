import { ActivatedRoute } from "@angular/router"
import { DocumentSnapshot, OrderByDirection, QueryConstraint, Timestamp, WhereFilterOp, orderBy, where } from "firebase/firestore"
import { Transaction } from "../interfaces/transaction.interface"


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
    return new Promise((resolve,reject)=>{

      route.queryParamMap.subscribe(i=>{
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
  }

  export function parseDocToTransaction(documentSnapshot:DocumentSnapshot):Transaction{
    const data = documentSnapshot.data()
    var value:Transaction = data as Transaction
    value.timeOfTransaction = (data!!['timeOfTransaction'] as Timestamp).toDate()
    return value
  }