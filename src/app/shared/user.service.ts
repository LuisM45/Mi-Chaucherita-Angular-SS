import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { EncryptionService } from './encryption.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  currentUser: firebase.default.User | null = null

  constructor(
    public authFire: AngularFireAuth,
    public encrSvc: EncryptionService
  ) {
    this.loadSession()
  }

loadSession(){
  var user = localStorage.getItem("user")
  if(user==null) return
  this.currentUser = JSON.parse(user)
  this.encrSvc.loadSession()
}


storeSession(){
  localStorage.setItem("user",JSON.stringify(this.currentUser))
  this.encrSvc.storeSession()
}

logWithPasswordAndEmail(email:string,password:string){
  // Returns a promise that is only fullfiled if the login was successful (User authenticated)
  return new Promise<firebase.default.User>((resolve,reject)=>{
    this.authFire.signInWithEmailAndPassword(email,password)
    .then( it=>{
      if(it.user == null) reject(it.operationType)
      resolve(it.user!!)
      this.currentUser = it.user
      this.encrSvc.initialize(email,password)
      this.storeSession()
    })
    .catch( e => {reject(e)})
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
      this.encrSvc.initialize(email,password)
      this.storeSession()
    })
    .catch( e => {reject(e)})
  })
  
}
logout(){
  localStorage.removeItem("user")
  this.currentUser = null
}
}
