import { Bytes } from "firebase/firestore";
import { PartialHomomorphicAlgorithm } from "../../interfaces/cryptography/partial_homomorfic_algorithm.interface";

export class ElGamal implements PartialHomomorphicAlgorithm{
    constructor(private key:string,private byteSize: number){}

    id = "ElGamal";
    encrypt = function <A>(arg0: A): string{
        return ""; // TODO: Code logic
    };
    decrypt = function <A>(arg0: string): A{
        return (0) as A //TODO: Code logic
    };

    operate = function (arg0: string): string{
        return (""); // TODO: Code logic
    };
    
}
