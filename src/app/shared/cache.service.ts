import { Injectable } from '@angular/core';
import { Timestamp } from 'firebase/firestore';

const DEFAULT_MAX_AGE_MS = 10000
interface CacheItem{
  timeOfExpiration: number,
  data: any
}

@Injectable({
  providedIn: 'root'
})



export class CacheService {
  dict = new Map<string,CacheItem>()
  ageArray:any[] = []

  constructor() {
  }

  get<E>(key: string): Promise<E>{
    return new Promise((resolve,reject)=>{
      var val = this.dict.get(key)
      if(val==undefined) {reject(); return}
      if(val.timeOfExpiration<= Date.now()) {this.remove(key); reject(); return}
      
      resolve(val.data)
    })
  }

  set(key:string,value: any,timeOfExpiration:number=Date.now()+DEFAULT_MAX_AGE_MS){
    this.dict.set(key,{timeOfExpiration:timeOfExpiration,data:value})
  }

  remove(key:string){
    this.dict.delete(key)
  }

  clear(){
    this.dict.clear()
  }
}
