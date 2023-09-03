import { Query, QueryConstraint } from "firebase/firestore";

export interface PagedQuery<E>{
    id: string,
    nextPage?: ()=>Promise<PagedQuery<E>>,
    prevPage?: ()=>Promise<PagedQuery<E>>,
    result: E[]
}