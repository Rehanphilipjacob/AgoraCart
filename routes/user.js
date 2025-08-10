var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')

const verifyLogin=(req,res,next)=>{
  if(req.session.userLoggedIn){
    next()
  }else{
     if (req.xhr) {
      return res.status(401).json({ redirectTo: '/login' });
    }
    res.redirect('/login');
  }
}
router.get('/', async function (req, res, next) {
  let user = req.session.user
  let cartCount = null
  if(req.session.userLoggedIn){
  userHelpers.getCartCount(req.session.user._id).then((result)=>{
    cartCount = result
  })
  } 
  productHelpers.getAllProducts().then((products) => {
    res.render('user/view-products', { products,user,cartCount})
  })
});
router.get('/login', (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {
    res.render('user/login', { loginErr: req.session.loginErr })
    req.session.userLoginErr = false
  }
})
router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user
       req.session.userLoggedIn = true
      res.redirect('/')
    } else {
      req.session.loginErr = "Invalid username or password"
      res.redirect('/login')
    }
  })
})
router.get('/signup', (req, res) => {
  res.render('user/signup')
})
router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response)
   
    req.session.user=response
    req.session.userLoggedIn=true
    res.redirect('/')
  })
})

router.get('/logout',(req, res) => {
  req.session.user = null;
  req.session.userLoggedIn = false;
  res.redirect('/')
})
router.get('/cart',verifyLogin,async(req, res) => {
  let total = await userHelpers.getTotalAmount(req.session.user._id)

  let products = userHelpers.getCartProducts(req.session.user._id).then((products)=>{
    res.render('user/cart',{total,products,user:req.session.user})
  })
})
router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
  })
})
router.post('/change-product-quantity',verifyLogin,async (req,res,next)=>{
  await userHelpers.changeProductQuantity(req.body).then(async(response)=>{
     console.log(response.total)
    response.total = await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
  })
})
router.get('/place-order',verifyLogin,async (req,res)=>{
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{total,user:req.session.user._id})
})
router.post('/place-order',async(req,res)=>{
  let products = await userHelpers.getCartProductList(req.body.userId)
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    if(req.body.paymentopt=='cod'){
    res.json({codSuccess :true})
  }
  else{
    userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
      res.json(response)
    })
  }
  })
})
router.get('/order-success',async(req,res)=>{
  res.render('user/order-success')
})
router.get('/view-orders',async(req,res)=>{
  let orders = await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/view-orders',{orders})
})
router.get('/view-order-products/:id',async(req,res)=>{
  let products = await userHelpers.getOrderProducts(req.params.id)
  console.log(products)
  res.render('user/view-order-products',{products}) 
})
router.post("/verify-payment",async(req,res)=>{
  console.log(req.body)
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log('Payment Status')
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err)
    res.json({status:false})
  })
})
module.exports = router;
