import { Bytes } from "firebase/firestore";

import { PartialHomomorphicAlgorithm } from "../../interfaces/cryptography/partial_homomorfic_algorithm.interface";
import { gcd, hexStringToBigint, modInverse, pow, randomBigInt } from "./Operations";
export class Pailler implements PartialHomomorphicAlgorithm{
    constructor(
        private key:string,
        private modLength: number = 2
        ){
            this.generateKeys()
    }

    private CERTAINTY:Number = 64;       // certainty with which primes are generated: 1-2^(-CERTAINTY)
    private p: bigint = BigInt(0);                   // a random prime
    private q: bigint = BigInt(0);;                   // a random prime (distinct from p)
    private lambda: bigint = BigInt(0);;              // lambda = lcm(p-1, q-1) = (p-1)*(q-1)/gcd(p-1, q-1)
    private n: bigint = BigInt(0);;                   // n = p*q
    private nsquare: bigint = BigInt(0);;             // nsquare = n*n
    private g: bigint = BigInt(0);;                   // a random integer in Z*_{n^2}
    private mu: bigint = BigInt(0);;                  // mu = (L(g^lambda mod n^2))^{-1} mod n, where L(u) = (u-1)/n

    private generateKeys(){
        
        this.p = randomBigInt()
        do {this.q = randomBigInt()} while(this.q == this.p) 

        this.lambda = (this.p-1n)*(this.q-1n)/(gcd(this.p-1n,this.q-1n))
        this.n = this.p*this.q
        this.nsquare = this.n*this.n

        do{
            this.g = this.randomZStarNSquare();
            var disc = pow(this.g, this.lambda, this.nsquare)-1n
            disc = disc/this.n
            disc = gcd(disc,this.n)
        } while (disc != 1n)
        
        // mu = (L(g^lambda mod n^2))^{-1} mod n, where L(u) = (u-1)/n
        this.mu = pow(this.g,this.lambda, this.nsquare)-1n
        this.mu = this.mu/this.n
        this.mu = modInverse(this.mu,this.n)
    }

    private randomZStarN():bigint{
        var r:bigint = 0n

        do{
            r = randomBigInt(this.modLength)
        } while(r >= this.n || gcd(r,this.n) != 1n)

        return r
    }

    private randomZStarNSquare():bigint{
        var r:bigint = 0n

        do{
            r = randomBigInt(this.modLength*2)
        } while(r >= this.nsquare || gcd(r,this.nsquare) != 1n)

        return r
    }



    id = "Pailler";
    encrypt (arg0: string): Promise<string>{
        return new Promise((resolve,reject)=>{
            var m = hexStringToBigint(arg0)
            if (m < 0n || m >= this.n){
                reject("Paillier.encrypt(BigInteger m): plaintext m is not in Z_n");
            }
            
            var r = this.randomZStarN();
            
            var ans = (pow(this.g,m, this.nsquare)*(pow(r,this.n, this.nsquare)))
            ans = ans%this.nsquare
            resolve(ans.toString(16))
        })
        
    };
    decrypt (arg0: string): Promise<string>{
        return new Promise((resolve,reject)=>{
            var c = hexStringToBigint(arg0)

            if (c<0n || c>=this.nsquare || gcd(c,this.nsquare) != 1n)
            {
                reject("Paillier.decrypt(BigInteger c): ciphertext c is not in Z*_{n^2}");
            }
            
            var ans = pow(c,this.lambda, this.nsquare)-1n
            ans = ans/this.n*this.mu%this.n

            resolve(ans.toString(16))
        })
    };

    operate = function (arg0: string): Promise<string>{
        return new Promise(()=>{});  // TODO: Code logic
    };
    
}