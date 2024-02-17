import { Bytes } from "firebase/firestore";
import { EncyrptionAlgorithm } from "../../interfaces/cryptography/encryption_algorithm.interface";
import { PromiseHolder } from "../PromiseHolder.class";
// import { createCipheriv,createDecipheriv,randomFill,createSecretKey } from "crypto"
// import { createCipheriv,createDecipheriv,randomFill,createSecretKey } from "crypto-browserify"

const crypto = require("crypto-browserify")


export class AES256 implements EncyrptionAlgorithm{
    private algorithmName = "AES-CBC"
    private lenght = 256;
    private key: Promise<CryptoKey>;

    constructor(private password:string){
        
        this.key = this._getCryptoKey(password)
    }

    async _getCryptoKey(password:string): Promise<CryptoKey>{
        ;
        const key = await window.crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
          );
      
        const derivedKey = window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: new Uint8Array(16),
                iterations: 250000,
                hash: 'SHA-256',
            },
            key,                       
            { name: 'AES-CBC', length: 256 },  //derivedKeyAlgorithm
            false,                             //expotable
            ['encrypt', 'decrypt']             //usage
            );
      
          return derivedKey;
    }

    async encrypt (plaintext: string): Promise<string>{
        // str -> buffer -> c(Buffer) -> c(base64)
        return new PromiseHolder(window.crypto.subtle.encrypt(
            {
                name: this.algorithmName,
                iv: new Uint8Array(16),
                // iv: window.crypto.getRandomValues(new Uint8Array(16)),
            },
            await this.key,
            new TextEncoder().encode(plaintext)
        )).pipe(e=>Buffer.from(e).toString("base64"))
        .promise
    };
    
    async decrypt (ciphertext: string): Promise<string>{
        return new PromiseHolder(window.crypto.subtle.decrypt(
            {
                name: this.algorithmName,
                iv: new ArrayBuffer(16), //The initialization vector you used to encrypt
            },
            await this.key, //from generateKey or importKey above
            Buffer.from(ciphertext,"base64") //ArrayBuffer of the data
        ))
        .pipe(e=>Buffer.from(e).toString('utf8'))
        .promise
    };

    
}
