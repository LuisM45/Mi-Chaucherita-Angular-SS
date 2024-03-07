import { DocumentReference } from "@firebase/firestore"
import { from } from "rxjs"
import { FixedPointDecimal } from "../classes/FixedPointDecimal.class"
import { Account } from "./accout.interface"

export interface Transaction{
    account?: Account,
    id?: string,
    title: string,
    amount: FixedPointDecimal,
    timeOfTransaction: Date
    description: string
}

