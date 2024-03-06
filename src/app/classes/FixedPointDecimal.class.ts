
const PRECISION = 2n
const RADIX = 10n
const DIVISOR = RADIX**PRECISION

export class FixedPointDecimal{
    private constructor(public b:bigint){}

    public static valueOf(a:undefined):FixedPointDecimal
    public static valueOf(b:bigint):FixedPointDecimal
    public static valueOf(s:string):FixedPointDecimal
    public static valueOf(s:any):FixedPointDecimal{
        if(typeof(s)=="bigint") return this.valueOfBigint(s)
        if(typeof(s)=="string") return this.valueOfString(s)
        return new FixedPointDecimal(0n)
    }

    private static valueOfBigint(b:bigint){
        return new FixedPointDecimal(b)
    }

    private static valueOfString(s:string){
        var sign = 1n
        if(s[0]=="-"){
            sign=-1n
            s = s.substring(1,s.length)
        }

        var [intPartStr,decPartStr] = s.split(".",2)
        if(decPartStr)
            decPartStr = decPartStr.padEnd(Number(PRECISION),"0").substring(0,Number(PRECISION))
        console.log([intPartStr,decPartStr])
        var intPart = BigInt(intPartStr)*DIVISOR*sign
        var decPart = decPartStr ? BigInt(decPartStr)*sign : 0n
        console.log([intPart,decPart])
        return this.valueOfBigint(intPart + decPart)
    }

    public toString():string{
        return FixedPointDecimal.toString(this.b)
    }

    public static toString(_bigint:bigint){
        console.log(_bigint)
        var sign = BigInt(Math.sign(Number(_bigint)))
        _bigint *= sign
        const intPart = _bigint/(DIVISOR)

        var decPart = _bigint%(DIVISOR)
        var decPartStr = ""
        if(decPart){
            decPartStr = "."+decPart.toString().padStart(Number(PRECISION),"0")
        }


        return `${sign>=0?'':'-'}${intPart}${decPartStr}`
    }
}