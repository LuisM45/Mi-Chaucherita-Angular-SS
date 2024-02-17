import { Bytes } from "firebase/firestore";
import { PartialHomomorphicAlgorithm } from "../../interfaces/cryptography/partial_homomorfic_algorithm.interface";

export class ElGamal implements PartialHomomorphicAlgorithm{
    constructor(private key:string,private byteSize: number){}

    id = "ElGamal";
    encrypt = function (arg0: string): Promise<string>{
        return new Promise(()=>{}); // TODO: Code logic
    };
    decrypt = function (arg0: string): Promise<string>{
        return new Promise(()=>{});  //TODO: Code logic
    };

    operate = function (arg0: string): Promise<string>{
        return new Promise(()=>{});  // TODO: Code logic
    };
    
}
