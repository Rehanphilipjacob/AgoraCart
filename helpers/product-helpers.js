var db = require('../config/connection')
const collections = require('../config/collections')
const {ObjectId} =require('mongodb')
module.exports={
    addProduct:async (product,callback)=>{
       // console.log(product)
    await db.get().collection('product').insertOne(product).then((data)=>{
            //console.log(data)
            //console.log(data.insertedId.toString())
            callback(data.insertedId.toString())
         })
    },
    
        getAllProducts:()=>{
            return new Promise(async(resolve,reject)=>{
                let products=await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
                resolve(products)
            }) 
        },
        deleteProduct:(prodId)=>{
            return new Promise(async(resolve,reject)=>{
                await db.get().collection(collections.PRODUCT_COLLECTION).deleteOne({_id:new ObjectId(prodId)}).then((response)=>{
                    console.log(response)
                    resolve(response)
                })
            })
        },
        getProductDetails:(proId)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:new ObjectId(proId)}).then((product)=>{
                    resolve(product)
                })
            })
        },
        updateProduct:(prodId,proDetails)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id:new ObjectId(prodId)},{$set:{
                    Name:proDetails.Name,
                    Description:proDetails.Description,
                    Category:proDetails.Category,
                    Price:proDetails.Price
                }}).then((result)=>{
                    resolve()
                })
            })
        }
    }
