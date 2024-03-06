import { DocumentReference } from "@firebase/firestore"
import { from } from "rxjs"
import { FixedPointDecimal } from "../classes/FixedPointDecimal.class"

export interface Transaction{
    account?: ()=>DocumentReference,
    id?: string,
    title: string,
    amount: FixedPointDecimal,
    timeOfTransaction: Date
    description: string
}

