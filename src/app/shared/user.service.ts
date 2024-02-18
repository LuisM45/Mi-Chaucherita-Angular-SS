import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { EncryptionService } from './encryption.service';
import { Globals } from './global';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  currentUser: firebase.default.User | null = null

  constructor(
    public authFire: AngularFireAuth,
    public encSvc: EncryptionService
  ) {
    this.loadSession()
  }

loadSession(){
  var user = localStorage.getItem("user")
  if(user==null) return
  this.currentUser = JSON.parse(user)
  Globals.resolvers.userId(this.currentUser!.uid)
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
      Globals.resolvers.userId(it.user!.uid)
      this.storeSession()
      this.encSvc.initialize(email,password)
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
      Globals.resolvers.userId(it.user!.uid)
      this.storeSession()
      this.encSvc.initialize(email,password)
    })
    .catch( e => {reject(e)})
  })
  
}
logout(){
  localStorage.removeItem("user")
  this.currentUser = null
  this.encSvc.logout()
}
}
