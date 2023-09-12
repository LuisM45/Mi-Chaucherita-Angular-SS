import { DocumentReference } from "@firebase/firestore"
import { from } from "rxjs"

export interface Transaction{
    account?: ()=>DocumentReference
    id?: string,
    title: string,
    amount: number,
    timeOfTransaction: Date
    description: string
}

