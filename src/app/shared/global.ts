var userIdResolver:(a:string)=>void
export const Globals={
    variables: {
        userId: new Promise((resolve,reject)=>userIdResolver=resolve) as Promise<string>
    },
    
    resolvers: {
        userId:(a:string)=>{
            userIdResolver(a)
            Globals.resolvers.userId = (r:string)=>{Globals.variables.userId=Promise.resolve(r)}
        }
    }
}



// export const variables = {
//     userId: new Promise((resolve,reject)=>userIdResolver=resolve)
// }

// export const resolvers = {
//     userId:(a:string)=>{userIdResolver(a)}
// }