import { Bytes } from "firebase/firestore";
import { EncyrptionAlgorithm } from "../../interfaces/cryptography/encryption_algorithm.interface";
import { PromiseHolder } from "../PromiseHolder.class";
import { SymmetricalEncyrptionAlgorithm } from "src/app/interfaces/cryptography/symmetrical_encryption_algorithm.interface";


export class AES256 implements SymmetricalEncyrptionAlgorithm{
    private static algorithmName = "AES-CBC"
    private static _length = 256;

    constructor(public readonly key: Promise<CryptoKey>){}


    static create():AES256;
    static create(password:string):AES256;
    static create(keyBuffer:Uint8Array):AES256;
    static create(parm0?:any):AES256{
        if(parm0==undefined) return this.createFromRandom()
        if(typeof(parm0)=="string") return this.createFromPassword(parm0)
        if(typeof(parm0)=="object") return this.createFromBytes(parm0)
        return this.createFromRandom()
    }

    private static createFromRandom():AES256{
        const key = window.crypto.subtle.generateKey({
            name: this.algorithmName,
            length: AES256._length
        },
            true,
            ["encrypt","decrypt"]
        ) as Promise<CryptoKey>
        return new AES256(key)
    }

    private static createFromBytes(bytes:Uint8Array):AES256{
        const key = window.crypto.subtle.importKey(
            "raw",
            bytes,
            { name: "AES-CBC" },
            true,
            ["encrypt", "decrypt"]
            )
        return new AES256(key)
    }

    private static createFromPassword(password:string):AES256{
        const key = this._getCryptoKey(password)
        return new AES256(key)
    }

    static async _getCryptoKey(password:string): Promise<CryptoKey>{
        
        const key = await window.crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(password),
            'PBKDF2',
            true,
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
            true,                             //expotable
            ['encrypt', 'decrypt']             //usage
            );
      
          return derivedKey;
    }

    async encrypt (plaintext: string): Promise<string>{
        var cryptBytes = this.raw_encrypt(new TextEncoder().encode(plaintext))
        return Buffer.from(await cryptBytes).toString("base64")
    };
    
    async decrypt (ciphertext: string): Promise<string>{
        var clearBytes = this.raw_decrypt(Buffer.from(ciphertext,"base64"))
        return Buffer.from(await clearBytes).toString('utf8')
    };

    async raw_encrypt(plainbytes: Uint8Array):Promise<Uint8Array>{
        var cryptBytes = await window.crypto.subtle.encrypt(
            {
                name: AES256.algorithmName,
                iv: new Uint8Array(16),
            },
            await this.key,
            plainbytes
        )
        return new Uint8Array(cryptBytes)
    }
    async raw_decrypt(cipherbytes: Uint8Array):Promise<Uint8Array>{
        var clearBytes = await window.crypto.subtle.decrypt(
            {
                name: AES256.algorithmName,
                iv: new ArrayBuffer(16),
            },
            await this.key,
            cipherbytes
        )
        return new Uint8Array(clearBytes)
    }
    
}
