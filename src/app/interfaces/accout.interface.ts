import { DocumentSnapshot } from "@firebase/firestore"
import { Transaction } from "./transaction.interface"
import { FixedPointDecimal } from "../classes/FixedPointDecimal.class"

export interface Account{
    id?: string,
    name: string,
    registerCount: bigint,
    currentValue:FixedPointDecimal,
    type: "income"| "spending" | "income and spending"
    transactions?: ()=>DocumentSnapshot[]
}

export interface NullableAccount{
    id?: string,
    name?: string,
    registerCount?: bigint,
    currentValue?:FixedPointDecimal,
    type?: "income"| "spending" | "income and spending"
}