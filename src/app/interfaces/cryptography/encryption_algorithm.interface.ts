import { Bytes } from "firebase/firestore";

export interface EncyrptionAlgorithm{
    id?: string,
    encrypt: (plaintext: string)=>Promise<string>,
    decrypt: (ciphertext: string)=>Promise<string>
}
