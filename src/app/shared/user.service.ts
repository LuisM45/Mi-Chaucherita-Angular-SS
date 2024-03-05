import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { EncryptionService } from './encryption.service';
import { Globals } from './global';
import { Router } from '@angular/router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  currentUser: firebase.default.User | null = null
  username = ""

  constructor(
    public authFire: AngularFireAuth,
    public firestore: Firestore,
    public encSvc: EncryptionService,
  ) {
    this.loadSession()
  }

loadSession(){
  var user = localStorage.getItem("user")
  if(user==null) return
  this.username = localStorage.getItem("username")!
  this.currentUser = JSON.parse(user)
  Globals.resolvers.userId(this.currentUser!.uid)
  this.encSvc.restoreKeysWithSession()
}


storeSession(){
  localStorage.setItem("user",JSON.stringify(this.currentUser))
  localStorage.setItem("username",this.username)
}

async logWithPasswordAndEmail(email:string,password:string):Promise<void>{
  const possibleUser = await this.authFire.signInWithEmailAndPassword(email,password)
  if(!possibleUser) return Promise.reject()

  this.currentUser = possibleUser.user
  Globals.resolvers.userId(this.currentUser!.uid)
  await this.encSvc.initializeFromLogin(email,password)
  await this.fetchUserdata()
  this.storeSession()

}

async registerWithPasswordAndEmail(username:string,email:string,password:string):Promise<void>{
  // Returns a promise that is only fullfiled if the registrations was successful (User authenticated)
  const possibleUser = await this.authFire.createUserWithEmailAndPassword(email,password)
  if(!possibleUser) return Promise.reject()

  this.currentUser = possibleUser!.user
  this.username=username
  Globals.resolvers.userId(this.currentUser!.uid)
  await this.encSvc.initializeFromRegister(email,password)
  await this.uploadUserdata()
  this.storeSession()
  
}

async fetchUserdata(){
  const docRef = doc(this.firestore,"userdata",this.currentUser!.uid)
  const docSnap = await getDoc(docRef)
  try{
    const userdata = await this.encSvc.cipherdocToUserData(docSnap)
    this.username = userdata.username
  }
  catch(e){
    console.error(e)
  }
  
}

async uploadUserdata(){
  // TODO: Edge cases
  const cipherobj = await this.encSvc.userdataToCipherobj({username:this.username})
  const docRef = doc(this.firestore,"userdata",this.currentUser!.uid)
  await setDoc(docRef,cipherobj)
}

logout(){
  localStorage.removeItem("user")
  this.currentUser = null
  this.encSvc.logout()
  window.location.reload()
}
}
