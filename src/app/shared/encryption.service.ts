import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
// import { createHash } from 'crypto';
import { EncyrptionAlgorithm } from '../interfaces/cryptography/encryption_algorithm.interface';
import { AES256 } from '../classes/cryptography/AES256.class';

const crypto = require("crypto-browserify")

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  privateKey = ""
  private symmetricEncryptor?: EncyrptionAlgorithm
  constructor() {
      this.symmetricEncryptor = new AES256(this.privateKey)
  }

  initialize(username:string, password:string){
    let hash1 = crypto.createHash("sha256").update(username).digest("base64")
    let hash2 = crypto.createHash("sha256").update(password).digest("base64")
    this.privateKey = crypto.createHash("sha256").update(hash1+hash2).digest("base64")

    this.symmetricEncryptor = new AES256(this.privateKey)
  }

  loadSession(){
    console.log("Loading key")
    let _apr = localStorage.getItem("apr")
    if(_apr)this.privateKey = _apr
    else this.privateKey = ""
    this.symmetricEncryptor?.encrypt("wawa").then(e=>{
      // console.log(e.length)
      // this.symmetricEncryptor?.decrypt("w8WXCl892qKNqnywbf/yEw==")
      this.symmetricEncryptor?.decrypt(e)
    })
    
    
  }
  
  storeSession(){
    console.log("Storing key")
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

  partialEncryption(){

  }

  partialDecryption(){

  }

  partialOperation(){
    
  }
}
