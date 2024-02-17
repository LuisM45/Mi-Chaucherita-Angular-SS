
export function gcd(a:bigint,b:bigint):bigint{
    if (a==0n) return b
    if (b==0n) return a
    return gcd(b,a%b)
}

export function pow(base:bigint,exponent:bigint,mod:bigint):bigint{
    var acc = base
    for(var a=1n;a<exponent;a++){
        acc = (acc * base)%mod
    }
    return acc
}

export function randomBigInt(bytes=8):bigint{
    var randomBytes = crypto.getRandomValues(new Uint8Array(8))
    var bytesAsHexString = bufferToHex(randomBytes)
    return BigInt(bytesAsHexString)
}

export function bufferToHex(buffer:Uint8Array):string{
    const bufferHexStr = Array.of(...buffer)
        .map(uint8=>uint8.toString(16).padStart(2,"0"))
        .join("")
    return (`0x${bufferHexStr}`)
}

export function hexStringToBigint(str:string):bigint{
    if(str[0]!='0' ||str[1]!='x') str = '0x'+str
    return BigInt(str)
}

export function stringToBigint(str:string,encoding:BufferEncoding):bigint{
    // plain:String -> Buffer ->UintArray8 -> hex:string -> hex:bigint
    var bytes = Buffer.from(str,encoding)
    var hexStr = bufferToHex(bytes)
    return BigInt(hexStr)
}

export function bigintToString(bint:bigint,encoding:BufferEncoding):string{
    // hex:bigint -> hex:str -> plain:String
    var hex = bint.toString(16)
    var bytes = Buffer.from(hex,"hex")
    return bytes.toString(encoding)
}

export function modInverse(base:bigint,modulo:bigint):bigint{
    return xgcd(base,modulo)[0]
}

export function xgcd(a:bigint, b:bigint):[bigint,bigint,bigint] { 

    if (b == 0n) {
      return [1n, 0n, a];
    }
  
    var temp = xgcd(b, a % b);
    var x = temp[0];
    var y = temp[1];
    var d = temp[2];
    return [y, x-y*BigInt(Math.floor(Number(a/b))), d];
  }