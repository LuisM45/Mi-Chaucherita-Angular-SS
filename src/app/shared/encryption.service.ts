import { Injectable, inject } from '@angular/core';
import { DocumentReference, DocumentSnapshot, Timestamp, collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { AES256 } from '../classes/cryptography/AES256.class';
import { PartialHomomorphicAlgorithm } from '../interfaces/cryptography/partial_homomorfic_algorithm.interface';
import { Pailler, PaillerParms } from '../classes/cryptography/Pailler.class';
import { Firestore } from '@angular/fire/firestore';
import { SymmetricalEncyrptionAlgorithm as SymmetricEncyrptionAlgorithm } from '../interfaces/cryptography/symmetrical_encryption_algorithm.interface';
import { Globals } from './global';
import { Account, NullableAccount } from '../interfaces/accout.interface';
import { Transaction } from '../interfaces/transaction.interface';
import { UserData } from '../interfaces/userdata.interface';

const PRECISION = 1000

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {


  private ready!:{
    master: Promise<void>
    symmetric: Promise<void>
    homomorfic: Promise<void>
    keydoc: Promise<void>
    keydocRef: Promise<void>
  }

  private settle= {
    master: ()=>{},
    symmetric: ()=>{},
    homomorfic: ()=>{},
    keydoc: ()=>{},
    keydocRef: ()=>{}
  }

  private encryptor!: {
    master?: SymmetricEncyrptionAlgorithm,
    symmetric?: SymmetricEncyrptionAlgorithm,
    homomorphic?: PartialHomomorphicAlgorithm
  }

  private keydoc?: DocumentSnapshot
  private keydocRef?: DocumentReference

  constructor(private firestore: Firestore = inject(Firestore)) {
    this.start()
  }

  private start(){
    this.encryptor={}
    this.ready = {
      master: new Promise((rs,rj)=>this.settle.master = (()=>rs(undefined))),
      symmetric: new Promise((rs,rj)=>this.settle.symmetric = (()=>rs(undefined))),
      homomorfic: new Promise((rs,rj)=>this.settle.homomorfic = (()=>rs(undefined))),
      keydoc: new Promise((rs,rj)=>this.settle.keydoc = (()=>rs(undefined))),
      keydocRef: new Promise((rs,rj)=>this.settle.keydocRef = (()=>rs(undefined)))
    }
  }

  async fetchKeydoc(){
    await this.setKeydocRef()
    this.keydoc = await getDoc(this.keydocRef!)
    this.settle.keydoc()
  }

  async setKeydocRef(){
    let userId = await Globals.variables.userId
    this.keydocRef = doc(this.firestore,"keys",userId)
    this.settle.keydocRef()
  }

  async restoreKeysWithSession(){
    this.readKeys()
  }

  async initializeFromLogin(username:string,password:string){
    this.deriveMasterKey(username,password)
    this.fetchKeydoc()
    this.fetchKeys()
    this.writeKeys()
  }

  async initializeFromRegister(username:string,password:string){
    this.deriveMasterKey(username,password)
    this.generateKeys()
    this.setKeydocRef()
    this.uploadKeys()
    this.writeKeys()
  }

  generateKeys(){
    this.generateSymmetricKey()
    this.generateHomomorphicKey()
  }

  generateSymmetricKey(){
    this.encryptor.symmetric = AES256.create()
    this.settle.symmetric()
  }

  generateHomomorphicKey(){
    this.encryptor.homomorphic = Pailler.create()
    this.settle.homomorfic()
  }

  async deriveMasterKey(username:string,password:string){
    let bufferedData = Buffer.from((username+":"+password),"utf8")
    let digestedData = await window.crypto.subtle.digest("SHA-512",bufferedData)
    let derivedPassword = Buffer.from(digestedData).toString("base64")

    this.encryptor.master = AES256.create(derivedPassword)
    this.settle.master()
  }

  async uploadKeys():Promise<boolean>{
    await this.ready.keydocRef
    await this.createEmptyKeydoc() // TODO: Control para reparar cuentas

    let promises = Promise.all([this.uploadSymmetricKey(),this.uploadHomomorphicKey()])
    return (await promises).every(_=>_)
  }

  async createEmptyKeydoc():Promise<boolean>{
    await this.ready.keydocRef
    console.log("creating empty doc")
    await setDoc(this.keydocRef!,{})

    return true
  }

  async uploadSymmetricKey():Promise<boolean>{
    await this.ready.master
    await this.ready.keydocRef
    await this.ready.symmetric

    let cryptokey = await this.encryptor.symmetric!.key
    let exportKey = await window.crypto.subtle.exportKey("raw",cryptokey)
    let cipheredKey = await this.encryptor.master!.raw_encrypt(Buffer.from(exportKey))
    let cryptBase64 = Buffer.from(cipheredKey).toString("base64")
    await updateDoc(this.keydocRef!,{"symmetric-key":cryptBase64})

    return true
  }

  async uploadHomomorphicKey():Promise<boolean>{
    await this.ready.master
    await this.ready.keydocRef
    await this.ready.homomorfic

    let parms = await (this.encryptor.homomorphic! as Pailler).getParms()
    let key = JSON.stringify(parms)
    let cryptkey = await this.encryptor.master!.encrypt(key)
    await updateDoc(this.keydocRef!,{"homomorphic-key":cryptkey})

    return true
  }

  async writeKeys():Promise<boolean>{
    // TODO: Manage errors idk
    let results = await Promise.all([this.writeMasterKey(), this.writeSymmetricKey(), this.writeHomomorphicKey()])

    return results.every(a=>a)
  }

  async writeMasterKey():Promise<boolean>{
    await this.ready.master
    let cryptokey = await this.encryptor.master!.key
    let key = await window.crypto.subtle.exportKey("raw",cryptokey)
    let keyBase64 = Buffer.from(key).toString("base64")
    localStorage.setItem("master-key",keyBase64)

    return true
  }

  async writeSymmetricKey():Promise<boolean>{
    await this.ready.symmetric

    let cryptokey = await this.encryptor.symmetric!.key
    let key = await window.crypto.subtle.exportKey("raw",cryptokey)
    let keyBase64 = Buffer.from(key).toString("base64")
    localStorage.setItem("symmetric-key",keyBase64)

    return true
  }

  async writeHomomorphicKey():Promise<boolean>{
    await this.ready.homomorfic

    let parms = await (this.encryptor.homomorphic! as Pailler).getParms()
    localStorage.setItem("homomorphic-key",JSON.stringify(parms))

    return true
  }

  async fetchKeys():Promise<boolean>{
    await this.ready.keydoc

    if (!this.keydoc!.exists()){
      console.log("not exists")
      this.generateKeys()
      await this.uploadKeys()
      return false
    }
    if(!await this.fetchSymmetricKey()){
      this.generateSymmetricKey()
      this.uploadSymmetricKey()
      return false // TODO: regenerate keys
    }
    if(!await this.fetchHomomorphicKey()){
      this.generateHomomorphicKey()
      this.uploadHomomorphicKey()
      return false // TODO: regenerate keys
    }
    return true
  }

  async fetchSymmetricKey():Promise<boolean>{
    await this.ready.master
    await this.ready.keydoc

    let cryptkey = this.keydoc!.get("symmetric-key")
    if(cryptkey==undefined){
      return false
    }

    let cryptbytes = Buffer.from(cryptkey,"base64")
    let keyBytes = await this.encryptor.master!.raw_decrypt(cryptbytes)
    this.encryptor.symmetric = AES256.create(keyBytes)
    this.settle.symmetric()
    return true
  }

  async fetchHomomorphicKey():Promise<boolean>{
    await this.ready.master
    await this.ready.keydoc

    let cryptkey = this.keydoc!.get("homomorphic-key")
    if(cryptkey==undefined) return false

    let cleartext = await this.encryptor.master!.decrypt(cryptkey)
    let paillerParms = JSON.parse(cleartext) as PaillerParms
    this.encryptor.homomorphic = Pailler.create(paillerParms)
    this.settle.homomorfic()
    return true
  }

  readKeys():boolean{
    if(!this.readMasterKey()) return false
    if(!this.readSymmetricKey()) return false // fetch/regenerate options
    if(!this.readHomomorphicKey()) return false // fetch/regenerate options

    return true
  }

  readMasterKey():boolean{
    let masterKey = localStorage.getItem("master-key")
    if(masterKey==undefined) return false

    let keyBytes = Buffer.from(masterKey,"base64")
    this.encryptor.master = AES256.create(keyBytes)
    this.settle.master()
    return true
  }

  readSymmetricKey():boolean{
    let symmetricKey = localStorage.getItem("symmetric-key")
    if(symmetricKey==undefined) return false

    let keyBytes = Buffer.from(symmetricKey,"base64")
    this.encryptor.symmetric = AES256.create(keyBytes)
    this.settle.symmetric()
    return true
  }

  readHomomorphicKey():boolean{
    let homomorphicKey = localStorage.getItem("homomorphic-key")
    if(homomorphicKey==undefined) return false

    let paillerParms = JSON.parse(homomorphicKey) as PaillerParms
    this.encryptor.homomorphic = Pailler.create(paillerParms)
    this.settle.homomorfic()
    return true
  }

  partialOperation(ciphertext1:string,ciphertext2:string):Promise<string>{
    return new Promise((a,b)=>{});
  }

  logout(){
    this.wipeLocalKeys()
    this.wipeEncryptors()
    this.start()
  }

  wipeEncryptors(){
    this.encryptor = {}
  }

  wipeLocalKeys(){
    localStorage.removeItem("master-key")
    localStorage.removeItem("symmetric-key")
    localStorage.removeItem("homomorphic-key")
  }

  async cipherdocToTransaction(documentSnapshot:DocumentSnapshot): Promise<Transaction>{
    await this.ready.homomorfic
    await this.ready.symmetric
    const data = documentSnapshot.data()!

    return {
      account: ()=>documentSnapshot.ref,
      id: documentSnapshot.id,
      title: await this.encryptor.symmetric!.decrypt(data['title']),
      amount: Number(await this.encryptor.homomorphic!.numberDecrypt(data['amount']))/PRECISION,
      timeOfTransaction: (data!!['timeOfTransaction'] as Timestamp).toDate(),
      description: await this.encryptor.symmetric!.decrypt(data['description']),
    }
  }

  async cipherdocToAccount(documentSnapshot:DocumentSnapshot):Promise<Account>{
    await this.ready.homomorfic
    await this.ready.symmetric
    const data = documentSnapshot.data()!
    return {
      id: documentSnapshot.id,
      name: await this.encryptor.symmetric!.decrypt(data['name']),
      registerCount: Number(await this.encryptor.homomorphic!.numberDecrypt(data['registerCount'])),
      currentValue: Number(await this.encryptor.homomorphic!.numberDecrypt(data['currentValue']))/PRECISION,
      type: (await this.encryptor.symmetric!.decrypt(data['type'])) as "income"| "spending" | "income and spending",
    }
  }

  async cipherobjToAccount(object:any):Promise<Account>{
    await this.ready.homomorfic
    await this.ready.symmetric
    return {
      // id: documentSnapshot.id,
      name: await this.encryptor.symmetric!.decrypt(object.name),
      registerCount: Number(await this.encryptor.homomorphic!.numberDecrypt(object.registerCount)),
      currentValue: Number(await this.encryptor.homomorphic!.numberDecrypt(object.currentValue))/PRECISION,
      type: (await this.encryptor.symmetric!.decrypt(object.type)) as "income"| "spending" | "income and spending",
    }

  }

  async transactionToCipherobj(transaction: Transaction): Promise<object>{
    await this.ready.homomorfic
    await this.ready.symmetric
    return {
      title: await this.encryptor.symmetric!.encrypt(transaction.title),
      amount: await this.encryptor.homomorphic!.numberEncrypt(BigInt(transaction.amount*PRECISION)),
      timeOfTransaction: transaction.timeOfTransaction,
      description: await this.encryptor.symmetric!.encrypt(transaction.description)
    }
  }
  
  async accountToCipherobj(account: Account): Promise<object>{
    await this.ready.homomorfic
    await this.ready.symmetric
    return {
      name: await this.encryptor.symmetric!.encrypt(account.name),
      registerCount: await this.encryptor.homomorphic!.numberEncrypt(BigInt(account.registerCount)),
      currentValue: await this.encryptor.homomorphic!.numberEncrypt(BigInt(account.currentValue*PRECISION)),
      type: await this.encryptor.symmetric!.encrypt(account.type),
    }
  }

  async userdataToCipherobj(userData: UserData):Promise<object>{
    await this.ready.symmetric
    return {
      username: await this.encryptor.symmetric!.encrypt(userData.username)
    }
  }

  async cipherdocToUserData(documentSnapshot:DocumentSnapshot):Promise<UserData>{
    const data = documentSnapshot.data()!
    
    await this.ready.symmetric
    return {
      username: await this.encryptor.symmetric!.decrypt(data["username"])
    }
  }

  async nullableAccountToCipherobj(nAccount: NullableAccount): Promise<object>{
    const cipherobj: {
      name?:string
      registerCount?:string
      currentValue?:string
      type?:string
    } = {}

    if(nAccount.name != undefined) cipherobj.name =await this.encryptor.symmetric!.encrypt(nAccount.name)
    if(nAccount.registerCount != undefined) cipherobj.registerCount = await this.encryptor.homomorphic!.numberEncrypt(BigInt(nAccount.registerCount))
    if(nAccount.currentValue != undefined) cipherobj.currentValue = await this.encryptor.homomorphic!.numberEncrypt(BigInt(nAccount.currentValue*PRECISION))
    if(nAccount.type != undefined) cipherobj.type =await this.encryptor.symmetric!.encrypt(nAccount.type)

    return cipherobj
  }
  
}


