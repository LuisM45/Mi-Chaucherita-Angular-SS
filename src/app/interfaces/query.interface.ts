
export interface Query<E>{
    id: string,
    previousId?: string | null,
    nextId?: string | null,
    result: E[]
}