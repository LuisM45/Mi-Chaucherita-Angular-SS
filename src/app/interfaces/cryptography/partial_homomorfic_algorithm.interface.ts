import { Bytes } from "firebase/firestore";
import { EncyrptionAlgorithm } from "./encryption_algorithm.interface";

export interface PartialHomomorphicAlgorithm extends EncyrptionAlgorithm{
    operate: (arg0: string, arg1: string)=>Promise<string>
    numberEncrypt: (plaintext: bigint)=>Promise<string>
    numberDecrypt: (ciphertext: string)=>Promise<bigint>
}
