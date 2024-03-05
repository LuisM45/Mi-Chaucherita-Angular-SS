import { Bytes } from "firebase/firestore";
import * as paillierBigint from "paillier-bigint"
import { PartialHomomorphicAlgorithm } from "../../interfaces/cryptography/partial_homomorfic_algorithm.interface";
import { bigintToString, bufferToHex, gcd, hexStringToBigint, modInverse, pow, randomBigInt, stringToBigint } from "./Operations";
import { EncyrptionAlgorithm } from "src/app/interfaces/cryptography/encryption_algorithm.interface";
export class Pailler implements PartialHomomorphicAlgorithm{

    
    constructor(private keys: Promise<paillierBigint.KeyPair>){

    }

    async numberEncrypt(plaintext: bigint): Promise<string>{
        const pk = (await this.keys).publicKey

        var complement2Plaintext = plaintext
        if (plaintext<0) complement2Plaintext = pk.n + plaintext

        var ciphertext: undefined | bigint
        var isDecryptable = false

        while (!isDecryptable){
            ciphertext = pk.encrypt(complement2Plaintext,100n)
            var decipheredText = await this.numberDecryptBigint(ciphertext)
            isDecryptable = decipheredText == plaintext
        }
        

        return bigintToString(ciphertext!,"base64")
    }
    async numberDecrypt(ciphertext: string): Promise<bigint>{
        const ciphertextBigInt = stringToBigint(ciphertext,"base64")
        return this.numberDecryptBigint(ciphertextBigInt)
    }

    private async numberDecryptBigint(ciphertext: bigint): Promise<bigint>{
        const pr = (await this.keys).privateKey
        const complement2Plaintext = (await this.keys).privateKey.decrypt(ciphertext)
        var plaintext = complement2Plaintext
        if(plaintext>=pr.n/2n) plaintext =  complement2Plaintext - pr.n
        return plaintext
    }

    async raw_encrypt(plainbytes: Uint8Array):Promise<Uint8Array>{
        return new Uint8Array()
    }

    async raw_decrypt(cipherbytes: Uint8Array):Promise<Uint8Array>{
        return new Uint8Array()
    }


    static create():Pailler;
    static create(bitlen:number):Pailler;
    static create(parms:PaillerParms):Pailler;
    static create(parm0?:any):Pailler{
        var retVal = this.createFromBitlen(3072)

        if(parm0==undefined) retVal = this.createFromBitlen(3072)
        if(typeof(parm0)=="number") retVal = this.createFromBitlen(parm0)
        if(typeof(parm0)=="object") retVal =  this.createFromParms(parm0)
        
        return retVal
    }

    private static createFromParms(parms: PaillerParms):Pailler{
        const n = stringToBigint(parms.n,"base64")
        const g = stringToBigint(parms.g,"base64")
        const lambda = stringToBigint(parms.lambda,"base64")
        const mu = stringToBigint(parms.mu,"base64")


        return new Pailler(
            new Promise((resolve,reject)=>{
                const pk = new paillierBigint.PublicKey(n,g)
                const pr = new paillierBigint.PrivateKey(lambda,mu,pk)

                resolve({
                    publicKey: pk,
                    privateKey: pr
                })
            })
        )
        
    }

    private static createFromBitlen(bitlen:number):Pailler{
        const keys = paillierBigint.generateRandomKeys()
        return new Pailler(keys)
    }

    async getParms():Promise<PaillerParms>{
        var keyPair = await this.keys
        return {        
            lambda: bigintToString(keyPair.privateKey.lambda,"base64"),
            mu: bigintToString(keyPair.privateKey.mu,"base64"),
            n: bigintToString(keyPair.privateKey.n,"base64"),
            g: bigintToString(keyPair.publicKey.g,"base64")
        }
    }

    id = "Pailler";
    async encrypt (arg0: string): Promise<string>{
        // str -> bigint -> c(bigint) -> c(buffer) -> base64
        // Sometimes doesnt work IDK why
        console.error("HERE1")
        var bigm = stringToBigint(arg0,"utf8")
        var bigc = (await this.keys).publicKey.encrypt(bigm)
        return bigintToString(bigc,"base64")
    };

    async decrypt (arg0: string): Promise<string>{
        console.error("HERE2")
        var bigc = stringToBigint(arg0,"base64")
        var bigm = (await this.keys).privateKey.decrypt(bigc)
        return bigintToString(bigm,"utf8")
    };

    async operate (arg0: string, arg1: string): Promise<string>{
        var c0 = stringToBigint(arg0,"base64")
        var c1 = stringToBigint(arg1,"base64")
        var cSum = (await this.keys).publicKey.addition(c0,c1)
        return bigintToString(cSum,"base64")
    };
    
}

export interface PaillerParms{
    lambda: string,
    mu: string,
    n: string,
    g: string,
}