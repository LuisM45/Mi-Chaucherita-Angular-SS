import { from } from "rxjs"

export interface Transaction{
    title: string,
    amount: number,
    timeOfTransaction: Date
    description: string
}

