import { Bytes } from "firebase/firestore";
import { EncyrptionAlgorithm } from "./encryption_algorithm.interface";

export interface SymmetricalEncyrptionAlgorithm extends EncyrptionAlgorithm{
    readonly key: Promise<CryptoKey>
}
