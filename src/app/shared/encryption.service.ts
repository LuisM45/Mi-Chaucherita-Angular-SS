import { Injectable, inject } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { CollectionReference, DocumentReference, DocumentSnapshot, Timestamp, collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { EncyrptionAlgorithm } from '../interfaces/cryptography/encryption_algorithm.interface';
import { AES256 } from '../classes/cryptography/AES256.class';
import { PartialHomomorphicAlgorithm } from '../interfaces/cryptography/partial_homomorfic_algorithm.interface';
import { Pailler, PaillerParms } from '../classes/cryptography/Pailler.class';
import { Firestore } from '@angular/fire/firestore';
import { SymmetricalEncyrptionAlgorithm as SymmetricEncyrptionAlgorithm } from '../interfaces/cryptography/symmetrical_encryption_algorithm.interface';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Globals } from './global';
import { Account } from '../interfaces/accout.interface';
import { Transaction } from '../interfaces/transaction.interface';
import { voidFunction } from './utils';

const crypto = require("crypto-browserify")

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  get keydocRef():Promise<DocumentReference> {
    let keyCol = collection(this.firestoreNew,"keys")
    return new Promise(async (resolve,reject)=>{
       resolve(await doc(keyCol,await Globals.variables.userId))
      })
  }

  private masterEncryptor: Promise<SymmetricEncyrptionAlgorithm>
  private symmetricEncryptor: Promise<SymmetricEncyrptionAlgorithm>
  private partialEncryptor: Promise<PartialHomomorphicAlgorithm>

  private resolvers = {
    masterEncryptor: voidFunction<SymmetricEncyrptionAlgorithm>,
    symmetricEncryptor: voidFunction<SymmetricEncyrptionAlgorithm>,
    partialEncryptor: voidFunction<PartialHomomorphicAlgorithm>
  }

  constructor(
    private firestoreNew: Firestore = inject(Firestore)
  ) {
    this.masterEncryptor = new Promise((rs,rj)=>this.resolvers.masterEncryptor = rs)
    this.symmetricEncryptor  = new Promise((rs,rj)=>this.resolvers.symmetricEncryptor = rs)
    this.partialEncryptor = new Promise((rs,rj)=>this.resolvers.partialEncryptor = rs)

    this.loadKeys()
  }




  async fetch(username:string, password:string){
    let hash1 = crypto.createHash("sha256").update(username).digest("base64")
    let hash2 = crypto.createHash("sha256").update(password).digest("base64")
    let privateKey = crypto.createHash("sha256").update(hash1+hash2).digest("base64")
    let masterEncryptor = AES256.create(privateKey)

    this.resolvers.masterEncryptor(masterEncryptor)

    let keydoc = await getDoc(await this.keydocRef)
    if (!keydoc.exists()){
      await this.regenerateKeyDoc()
      keydoc = await getDoc(await this.keydocRef)
    }

    const symKeyB64:string = keydoc.get("symmetric")

    if(symKeyB64 == undefined) this.regenerateSymKey()
    else{
      const symKey = masterEncryptor.raw_decrypt(Buffer.from(symKeyB64,"base64"))
      this.resolvers.symmetricEncryptor(AES256.create(await symKey))
    }


    const parKeyB64:string = keydoc.get("partial")
    if(parKeyB64 == undefined) this.regenerateParKey()
    else{
      const parKey = JSON.parse(await masterEncryptor.decrypt(parKeyB64)) as PaillerParms
      this.resolvers.partialEncryptor(Pailler.create(await parKey))
    }

    this.storeKeys()
  }

  async regenerateKeyDoc(){
    setDoc(await this.keydocRef,{})
  }

  async regenerateSymKey(){
    let keydocRef = await this.keydocRef
    let symmetricEncryptor = AES256.create()

    this.resolvers.symmetricEncryptor(symmetricEncryptor)
    const exportKey =  await window.crypto.subtle.exportKey("raw",await symmetricEncryptor.key)
    const cryptKey = await (await this.masterEncryptor).raw_encrypt(new Uint8Array(exportKey))
    let newDoc = {symmetric: Buffer.from(cryptKey).toString("base64")}

    updateDoc(keydocRef,newDoc)
  }

  async regenerateParKey(){
    let keydocRef = await this.keydocRef

    let pailler = Pailler.create()
    this.resolvers.partialEncryptor(pailler)
    const exportKey =  JSON.stringify(await pailler.getParms())
    const cryptKey = await (await this.masterEncryptor).encrypt(exportKey)
    let newDoc = {partial: cryptKey}

    updateDoc(keydocRef,newDoc)
 }


  async loadKeys(): Promise<boolean>{
    let masterKeyString = localStorage.getItem("master_key")!
    if(masterKeyString==undefined) return false
    let masterKeyBuffer = Buffer.from(masterKeyString,"base64")
    this.resolvers.masterEncryptor(AES256.create(masterKeyBuffer))

    let symKeyString = localStorage.getItem("symetrical_key")!
    let symKeyBuffer = Buffer.from(symKeyString,"base64")
    this.resolvers.symmetricEncryptor(AES256.create(symKeyBuffer))

    let parKeyString = localStorage.getItem("partial_key")!
    let parKeyParms = JSON.parse(parKeyString) as PaillerParms
    this.resolvers.partialEncryptor(Pailler.create(parKeyParms))

    return true
  }
  
  async storeKeys(){
    let masterEncryptor =  await this.masterEncryptor
    let masterKey = await masterEncryptor.key;
    let masterKeyBuffer = await window.crypto.subtle.exportKey("raw",masterKey);
    let masterKeyString  = Buffer.from(masterKeyBuffer).toString("base64");
    
    localStorage.setItem("master_key",masterKeyString)

    let symmetricEncryptor = await this.symmetricEncryptor
    let symKey = await symmetricEncryptor.key
    let symKeyBuffer = await window.crypto.subtle.exportKey("raw",symKey)
    let symKeyString  = Buffer.from(symKeyBuffer).toString("base64")
    

    localStorage.setItem("symetrical_key",symKeyString)

    let partialEncryptor = await this.partialEncryptor as Pailler
    let parKey = await partialEncryptor.getParms()
    let parKeyString  = JSON.stringify(parKey)
    
    localStorage.setItem("partial_key",parKeyString)
  }

  async symmetricEncryption(plaintext:string):Promise<string>{
    let symmetricEncryptor = await this.symmetricEncryptor
    return symmetricEncryptor.encrypt(plaintext)
  }

  async symmetricDecryption(ciphertext:string):Promise<string>{
    let symmetricEncryptor = await this.symmetricEncryptor
    return symmetricEncryptor.decrypt(ciphertext)
  }

  assymetricEncryption(){

  }

  assymetricDecryption(){

  }

  async partialEncryption(plaintext:string):Promise<string>{
    let partialEncryptor = await this.partialEncryptor
    return partialEncryptor!!.encrypt(plaintext)
  }

  async partialDecryption(ciphertext:string):Promise<string>{
    let partialEncryptor = await this.partialEncryptor
    return partialEncryptor.decrypt(ciphertext)
  }

  partialOperation(ciphertext1:string,ciphertext2:string):Promise<string>{
    return new Promise((a,b)=>{});
  }

  logout(){
    localStorage.removeItem("master_key")
    localStorage.removeItem("symetrical_key")
    localStorage.removeItem("partial_key")
  }

  async cipherdocToTransaction(documentSnapshot:DocumentSnapshot): Promise<Transaction>{
    const data = documentSnapshot.data()!

    return {
      account: ()=>documentSnapshot.ref,
      id: documentSnapshot.id,
      title: await this.symmetricDecryption(data['title']),
      amount: Number(await this.partialDecryption(data['amount'])),
      timeOfTransaction: (data!!['timeOfTransaction'] as Timestamp).toDate(),
      description: await this.symmetricDecryption(data['description']),
    }
  }

  async cipherdocToAccount(documentSnapshot:DocumentSnapshot):Promise<Account>{
    const data = documentSnapshot.data()!
    return {
      id: documentSnapshot.id,
      name: await this.symmetricDecryption(data['name']),
      registerCount: Number(await this.partialDecryption(data['registerCount'])),
      currentValue: Number(await this.partialDecryption(data['currentValue'])),
      type: (await this.symmetricDecryption(data['type'])) as "income"| "spending" | "income and spending",
  }
  }

  async transactionToCipherobj(transaction: Transaction): Promise<object>{
    return {
      title: await this.symmetricEncryption(transaction.title),
      amount: await this.partialEncryption(transaction.amount.toString()),
      timeOfTransaction: transaction.timeOfTransaction,
      description: await this.symmetricEncryption(transaction.description)
    }
  }
  
  async accountToCipherobj(account: Account): Promise<object>{
    return {
      name: await this.symmetricEncryption(account.name),
      registerCount: await this.partialEncryption(account.registerCount.toString()),
      currentValue: await this.partialEncryption(account.currentValue.toString()),
      type: await this.symmetricEncryption(account.type),
  }
  }
  
}


