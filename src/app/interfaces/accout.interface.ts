import { DocumentSnapshot } from "@firebase/firestore"
import { Transaction } from "./transaction.interface"

export interface Account{
    id?: string,
    name: string,
    registerCount: number,
    currentValue:number,
    type: "income"| "spending" | "income and spending"
    transactions?: ()=>DocumentSnapshot[]
}
