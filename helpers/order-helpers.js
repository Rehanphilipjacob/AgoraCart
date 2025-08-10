var db = require('../config/connection')
const collections = require('../config/collections')
const {ObjectId} =require('mongodb')
module.exports ={
     getAllOrders:()=>{
            return new Promise(async(resolve,reject)=>{
                let orders=await db.get().collection(collections.ORDER_COLLECTION).find().toArray()
                resolve(orders)
            }) 
        },
    updateOrderStatus:(orderId, status)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:new ObjectId(orderId)},{$set:{status:status}}).then(()=>{
                resolve()
            })
        })
    }
}