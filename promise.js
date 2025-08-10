// function promiseOne(result){
// return new Promise((resolve,reject)=>{
// setTimeout(()=>{console.log("I am first Promise "+result)},2000);
// resolve("1")})
// }
// function promiseTwo(result){
//     return new Promise((resolve,reject)=>{
//         setTimeout(()=>{console.log("I am second Promise "+result)},2000)
//         resolve("2")
//     })
// }
// promiseOne("hello").then(promiseTwo)