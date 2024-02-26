import { Bytes } from "firebase/firestore";

export interface EncyrptionAlgorithm{
    readonly id?: string,
    encrypt: (plaintext: string)=>Promise<string>,
    decrypt: (ciphertext: string)=>Promise<string>,
    raw_encrypt: (plainbytes: Uint8Array)=>Promise<Uint8Array>,
    raw_decrypt: (cipherbytes: Uint8Array)=>Promise<Uint8Array>,
}
