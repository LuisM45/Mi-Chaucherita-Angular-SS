import { Bytes } from "firebase/firestore";
import { EncyrptionAlgorithm } from "./encryption_algorithm.interface";

export interface PartialHomomorphicAlgorithm extends EncyrptionAlgorithm{
    operate: (arg0: string)=>Promise<string>
}
