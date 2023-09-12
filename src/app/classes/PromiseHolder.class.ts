export class PromiseHolder<E>{
    constructor(private _promise:Promise<E>){}

    pipe<F>(fun:(e:E)=>F):PromiseHolder<F>{
        return new PromiseHolder(new Promise( (resolve,reject)=>{
            this._promise.then(e=>resolve(fun(e)))
            .catch(ex=>reject(ex))
        }))
    }

    peek(fun:(e:E)=>any):PromiseHolder<E>{
        this._promise.then(e=>fun(e))
        return this
    }

    joinPromise<F>(promise:Promise<F>):PromiseHolder<{first:E,latter:F}>{
        return new PromiseHolder(new Promise((resolve,reject)=>{
            this._promise.then(resultFirst=>{
                promise.then(resultLatter=>{
                    resolve({first:resultFirst,latter:resultLatter})
                })
                .catch(reject)
            })
            .catch(reject)
        }))
    }

    pipeFlat<F>(fun:(e:E)=>Promise<F>):PromiseHolder<F>{
        var newPromise = new Promise<F>((resolve,reject)=>{
            this._promise.then(res1=>{
                fun(res1).then(res2=>resolve(res2))
                .catch(ex2=>reject(ex2))
            })
            .catch(ex1=>reject(ex1))
        })
        return new PromiseHolder(newPromise)
    }

    rejectWhen(...fun:((e:E)=>boolean)[]):PromiseHolder<E>{
        return new PromiseHolder(new Promise( (resolve,reject)=>{
            this._promise.then(result=>{
                if(fun.some(f=>f(result))) reject("Condition not satisfied")
                else resolve(result)
            }).catch(reject)
        }))
    }

    get promise(){
        return this._promise
    }
}

