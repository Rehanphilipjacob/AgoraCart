var db = require('../config/connection')
const collections = require('../config/collections')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const Razorpay = require('razorpay');
var instance = new Razorpay({
    key_id: 'rzp_test_VK0NdDGJ0iq8LF',
    key_secret: 'UHpg8ru3mAZoIOBMn738W1Ri',
});
module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.Password = await bcrypt.hash(userData.Password, 10)
            console.log(userData)
            db.get().collection(collections.USER_COLLECTION).insertOne(userData).then(result => {
                resolve(result)
            })
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {}
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ Email: userData.Email })
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {
                        console.log("login success");
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('login failed');
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("User Not Created");
                resolve({ status: false })
            }
        })
    },
    addToCart: (proId, userId) => {
        let proObj = {
            item: new ObjectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: new ObjectId(userId) })
            //await db.get().createCollection(collections.CART_COLLECTION); 
            //console.log('Collection created successfully');
            // if(!userCart){
            //     console.log("User Cart does not exist")
            // }
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item.equals(new ObjectId(proId)))
                console.log(proExist)
                if (proExist != -1) {
                    db.get().collection(collections.CART_COLLECTION).updateOne({ user: new ObjectId(userId), 'products.item': new ObjectId(proId) }, {
                        $inc: { 'products.$.quantity': 1 }
                    }).then(() => {
                        resolve()
                    })
                }
                else {
                    db.get().collection(collections.CART_COLLECTION).updateOne({ user: new ObjectId(userId) }, {
                        $push: { products: proObj }
                    }).then((response) => {
                        resolve()
                    })
                }
            } else {
                let cartObj = {
                    user: new ObjectId(userId),
                    products: [proObj]
                }
                db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve();
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([
                { $match: { user: new ObjectId(userId) } },
                { $unwind: '$products' },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: "product"

                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
                // {$lookup:{
                //     from:collections.PRODUCT_COLLECTION,
                //     let:{prodList:'$products'},
                //     pipeline:[
                //         {
                //             $match:{
                //                 $expr:{$in:['$_id',"$$prodList"]}
                //             }
                //         }
                //         ],as:'cartItems'
                //     }}

            ]).toArray()
            // console.log(cartItems[0].products)
            resolve(cartItems)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: new ObjectId(userId) })
            if (cart) {
                resolve(cart.products.length)
            } else {
                resolve(0)
            }
        })
    },
    changeProductQuantity: (details) => {
        return new Promise((resolve, reject) => {
            details.product = new ObjectId(details.product)
            details.cart = new ObjectId(details.cart)
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collections.CART_COLLECTION).updateOne({ _id: details.cart }, {
                    $pull: { products: { item: details.product } }
                }).then((response) => { resolve({ removeProduct: true }) })
            }
            else {
                db.get().collection(collections.CART_COLLECTION).updateOne({ _id: details.cart, 'products.item': new ObjectId(details.product) }, {
                    $inc: { 'products.$.quantity': parseInt(details.count) }
                }).then(() => {
                    resolve({ status: true })
                })
            }
        })
    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collections.CART_COLLECTION).aggregate([
                { $match: { user: new ObjectId(userId) } },
                { $unwind: '$products' },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: "product"

                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: { $toDecimal: '$quantity' },
                        price: { $toDecimal: '$product.Price' }  // Convert 'Price' to decimal
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$price'] } }
                    }
                }
            ]).toArray()
            if (total.length === 0) {
                resolve(0)
            } else {
                resolve(total[0].total)
            }

        })
    },
    placeOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {
            // console.log(order,products,total);
            let status = order.paymentopt === 'cod' ? 'placed' : 'pending'
            let orderObj = {
                deliveryDetails: {
                    mobile: order.mobile,
                    address: order.address,
                    pincode: order.pincode
                },
                userId: new ObjectId(order.userId),
                paymentMethod: order.paymentopt,
                products: products,
                totalAmount: total,
                status: status,
                date: new Date()
            }
            db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then(async (response) => {
                await db.get().collection(collections.CART_COLLECTION).deleteOne({ user: new ObjectId(order.userId) })
                // console.log(response.insertedId.toString())                                                                                              
                resolve(response.insertedId.toString())
            })
        })
    },
    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: new ObjectId(userId) })
            resolve(cart)
        })
    },
    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collections.ORDER_COLLECTION).find({ userId: new ObjectId(userId) }).toArray()
            resolve(orders)
        })
    },
    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: new ObjectId(orderId) }
                },
                {
                    $project: { products: '$products.products' }
                },
                { $unwind: '$products' },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'cartProducts'
                    }
                }, {
                    $project: {
                        item: 1, quantity: 1, cartProducts: { $arrayElemAt: ['$cartProducts', 0] }
                    }
                }

            ]).toArray();
            resolve(products)
        })
    },
    generateRazorpay: (orderId, total) => {
        console.log("OrderId:", orderId)
        return new Promise((resolve, reject) => {

            var options = {
                amount: total * 100,  // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
                currency: "INR",
                receipt: orderId
            };
            instance.orders.create(options, function (err, order) {
                console.log("Error for razorpay:", err)
                console.log("New Order:", order);
                resolve(order)
            });
        })
    },
    verifyPayment:(details)=>{
        return new Promise((resolve,reject)=>{
            const crypto = require('crypto')
            const hmac = crypto.createHmac('sha256', 'UHpg8ru3mAZoIOBMn738W1Ri');
            hmac.update(details['payment[razorpay_order_id]']+"|"+details['payment[razorpay_payment_id]'])
            generated_signature = hmac.digest('hex')
            console.log("generated_signature:"+generated_signature)
            console.log("received_signature:"+details['payment[razorpay_signature['])
            if(generated_signature==details['payment[razorpay_signature]']){
                resolve()
            }else{
                reject()
            }
        })
    },
    changePaymentStatus:(orderId)=>{
        return new Promise(async (resolve,reject)=>{

            await db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:new ObjectId(orderId)},{$set:{status:'placed'}}).then(()=>{
                resolve()
            })
        })
    }
}
