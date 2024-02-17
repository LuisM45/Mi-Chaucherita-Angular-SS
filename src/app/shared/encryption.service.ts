import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
// import { createHash } from 'crypto';
import { EncyrptionAlgorithm } from '../interfaces/cryptography/encryption_algorithm.interface';
import { AES256 } from '../classes/cryptography/AES256.class';
import { PartialHomomorphicAlgorithm } from '../interfaces/cryptography/partial_homomorfic_algorithm.interface';
import { Pailler } from '../classes/cryptography/Pailler.class';

const crypto = require("crypto-browserify")

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  privateKey = ""
  private symmetricEncryptor?: EncyrptionAlgorithm
  private partialEncryptor?: PartialHomomorphicAlgorithm
  constructor() {
    this.symmetricEncryptor = new AES256(this.privateKey)
    this.partialEncryptor = new Pailler(this.privateKey)
  }

  initialize(username:string, password:string){
    let hash1 = crypto.createHash("sha256").update(username).digest("base64")
    let hash2 = crypto.createHash("sha256").update(password).digest("base64")
    this.privateKey = crypto.createHash("sha256").update(hash1+hash2).digest("base64")

    this.symmetricEncryptor = new AES256(this.privateKey)
    this.partialEncryptor = new Pailler(this.privateKey)

  }

  loadSession(){
    let _apr = localStorage.getItem("apr")
    if(_apr)this.privateKey = _apr
    else this.privateKey = ""
  }
  
  storeSession(){
    localStorage.setItem("apr",this.privateKey)
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
}
