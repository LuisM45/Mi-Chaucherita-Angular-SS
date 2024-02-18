import { Injectable, inject } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { CollectionReference, DocumentReference, collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { EncyrptionAlgorithm } from '../interfaces/cryptography/encryption_algorithm.interface';
import { AES256 } from '../classes/cryptography/AES256.class';
import { PartialHomomorphicAlgorithm } from '../interfaces/cryptography/partial_homomorfic_algorithm.interface';
import { Pailler, PaillerParms } from '../classes/cryptography/Pailler.class';
import { Firestore } from '@angular/fire/firestore';
import { SymmetricalEncyrptionAlgorithm as SymmetricEncyrptionAlgorithm } from '../interfaces/cryptography/symmetrical_encryption_algorithm.interface';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Globals } from './global';

const crypto = require("crypto-browserify")

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  get keydocRef():Promise<DocumentReference> {
    var keyCol = collection(this.firestoreNew,"keys")
    return new Promise(async (resolve,reject)=>{
       resolve(await doc(keyCol,await Globals.variables.userId))
      })
  }

  private masterEncryptor?: SymmetricEncyrptionAlgorithm
  private symmetricEncryptor?: SymmetricEncyrptionAlgorithm
  private partialEncryptor?: PartialHomomorphicAlgorithm

  constructor(
    private firestoreNew: Firestore = inject(Firestore)
  ) {
    this.loadKeys()
  }


  async initialize(username:string, password:string){
    let hash1 = crypto.createHash("sha256").update(username).digest("base64")
    let hash2 = crypto.createHash("sha256").update(password).digest("base64")
    var privateKey = crypto.createHash("sha256").update(hash1+hash2).digest("base64")
    this.masterEncryptor = AES256.create(privateKey)

    var keydoc = await getDoc(await this.keydocRef)
    const symKeyB64:string = keydoc.get("symmetric")

    if(symKeyB64 == undefined) this.regenerateSymKey()
    else{
      const symKey = this.masterEncryptor.raw_decrypt(Buffer.from(symKeyB64,"base64"))
      this.symmetricEncryptor = AES256.create(await symKey)
    }


    const parKeyB64:string = keydoc.get("partial")
    if(parKeyB64 == undefined) this.regenerateParKey()
    else{
      const parKey = JSON.parse(await this.masterEncryptor.decrypt(parKeyB64)) as PaillerParms
      console.log(`recovered:${JSON.stringify(parKey)}`)
      this.partialEncryptor = Pailler.create(await parKey)
    }

    this.storeKeys()
  }

  async regenerateSymKey(){
     var keydocRef = await this.keydocRef

    this.symmetricEncryptor = AES256.create()
    const exportKey =  await window.crypto.subtle.exportKey("raw",await this.symmetricEncryptor!.key)
    const cryptKey = await this.masterEncryptor!.raw_encrypt(new Uint8Array(exportKey))
    var newDoc = {symmetric: Buffer.from(cryptKey).toString("base64")}

    updateDoc(keydocRef,newDoc)
  }

  async regenerateParKey(){
    var keydocRef = await this.keydocRef

    var pailler = Pailler.create()
    this.partialEncryptor = pailler
    const exportKey =  JSON.stringify(await pailler.getParms())
    const cryptKey = await this.masterEncryptor!.encrypt(exportKey)
    var newDoc = {partial: cryptKey}

    console.log("original:"+JSON.stringify(await pailler.getParms()))

    updateDoc(keydocRef,newDoc)
 }


  async loadKeys(): Promise<boolean>{
    var masterKeyString = localStorage.getItem("master_key")!
    if(masterKeyString==undefined) return false
    var masterKeyBuffer = Buffer.from(masterKeyString,"base64")
    this.masterEncryptor = AES256.create(masterKeyBuffer)

    var symKeyString = localStorage.getItem("symetrical_key")!
    var symKeyBuffer = Buffer.from(symKeyString,"base64")
    this.symmetricEncryptor = AES256.create(symKeyBuffer)

    var parKeyString = localStorage.getItem("partial_key")!
    var parKeyParms = JSON.parse(parKeyString) as PaillerParms
    this.partialEncryptor = Pailler.create(parKeyParms)


    // var p1 = Pailler.create()
    // var p2 = Pailler.create(await p1.getParms())
    // var amount = "notin"
    // var camount = await p1.encrypt(amount)
    // var pamount = await p2.decrypt(camount)
    // console.log(`amount ${amount}`)
    // console.log(`camount ${camount}`)
    // console.log(`pamount ${pamount}`)

    return true
  }
  
  async storeKeys(){
    var masterKey = await this.masterEncryptor!.key;
    var masterKeyBuffer = await window.crypto.subtle.exportKey("raw",masterKey);
    var masterKeyString  = Buffer.from(masterKeyBuffer).toString("base64");
    
    localStorage.setItem("master_key",masterKeyString)

    var symKey = await this.symmetricEncryptor!.key
    var symKeyBuffer = await window.crypto.subtle.exportKey("raw",symKey)
    var symKeyString  = Buffer.from(symKeyBuffer).toString("base64")
    
    localStorage.setItem("symetrical_key",symKeyString)

    var parKey = await (await this.partialEncryptor as Pailler).getParms()
    var parKeyString  = JSON.stringify(parKey)
    
    localStorage.setItem("partial_key",parKeyString)
  }

  symmetricEncryption(plaintext:string):Promise<string>{
    return this.symmetricEncryptor!!.encrypt(plaintext)
  }

  symmetricDecryption(ciphertext:string):Promise<string>{
    return this.symmetricEncryptor!!.decrypt(ciphertext)
  }

  assymetricEncryption(){

  }

  assymetricDecryption(){

  }

  partialEncryption(plaintext:string):Promise<string>{
    return this.partialEncryptor!!.encrypt(plaintext)
  }

  partialDecryption(ciphertext:string):Promise<string>{
    return this.partialEncryptor!!.decrypt(ciphertext)
  }

  partialOperation(ciphertext1:string,ciphertext2:string):Promise<string>{
    return new Promise((a,b)=>{});
  }

  logout(){
    localStorage.removeItem("master_key")
    localStorage.removeItem("symetrical_key")
    localStorage.removeItem("partial_key")
  }
}
