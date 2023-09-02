import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  currentUser: firebase.default.User | null = null

  constructor(
    public authFire: AngularFireAuth
  ) {
    this.loadSession()
  }

loadSession(){
  console.log("loading user")
  var user = localStorage.getItem("user")
  if(user==null) return
  this.currentUser = JSON.parse(user)
}

storeSession(){
  localStorage.setItem("user",JSON.stringify(this.currentUser))
}

logWithPasswordAndEmail(email:string,password:string){
  // Returns a promise that is only fullfiled if the login was successful (User authenticated)
  return new Promise<firebase.default.User>((resolve,reject)=>{
    this.authFire.signInWithEmailAndPassword(email,password)
    .then( it=>{
      if(it.user == null) reject(it.operationType)
      resolve(it.user!!)
      this.currentUser = it.user
      this.storeSession()
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
      this.storeSession()
    })
    .catch( e => {console.log(e);reject(e)})
  })
  
}
logout(){

}
}
