import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  currentUser: firebase.default.User | null = null
  userId: string | null = null

  constructor(
    public authFire: AngularFireAuth
  ) {
    
  }

logWithPasswordAndEmail(email:string,password:string){
  // Returns a promise that is only fullfiled if the login was successful (User authenticated)
  return new Promise<firebase.default.User>((resolve,reject)=>{
    this.authFire.signInWithEmailAndPassword(email,password)
    .then( it=>{
      if(it.user == null) reject(it.operationType)
      resolve(it.user!!)
      this.currentUser = it.user
      this.userId = this.currentUser!!.uid
    })
    .catch( e => {console.log(e);reject(e)})
  })
}

registerWithPasswordAndEmail(email:string,password:string){
  // Returns a promise that is only fullfiled if the registrations was successful (User authenticated)
  return new Promise<firebase.default.User>((resolve,reject)=>{
    this.authFire.createUserWithEmailAndPassword(email,password)
    .then( it=>{
      if(it.user == null) reject(it.operationType)
      resolve(it.user!!)
      this.currentUser = it.user
      this.userId = this.currentUser!!.uid
    })
    .catch( e => {console.log(e);reject(e)})
  })
  
}
logout(){

}
}
