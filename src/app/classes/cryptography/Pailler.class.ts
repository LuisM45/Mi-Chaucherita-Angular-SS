import { Bytes } from "firebase/firestore";
import * as paillierBigint from "paillier-bigint"
import { PartialHomomorphicAlgorithm } from "../../interfaces/cryptography/partial_homomorfic_algorithm.interface";
import { bigintToString, bufferToHex, gcd, hexStringToBigint, modInverse, pow, randomBigInt, stringToBigint } from "./Operations";
export class Pailler implements PartialHomomorphicAlgorithm{

    keys: Promise<paillierBigint.KeyPair>
    constructor(
        private key:string
        ){
            this.keys = paillierBigint.generateRandomKeys(3072)
    }

    
    id = "Pailler";
    async encrypt (arg0: string): Promise<string>{
        // str -> bigint -> c(bigint) -> c(buffer) -> base64
        var bigm = stringToBigint(arg0,"utf8")
        var bigc = (await this.keys).publicKey.encrypt(bigm)
        return bigintToString(bigc,"base64")
    };

    async decrypt (arg0: string): Promise<string>{
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