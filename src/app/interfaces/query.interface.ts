import { Query, QueryConstraint } from "firebase/firestore";

export interface PagedQuery<E>{
    nextPage?: ()=>Promise<PagedQuery<E>>,
    prevPage?: ()=>Promise<PagedQuery<E>>,
    results: E[]
}