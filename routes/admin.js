var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')
const orderHelpers= require('../helpers/order-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProducts().then((products)=>{
    res.render('admin/view-products',{admin:true,products})
  })
  
});
  router.get('/add-product',(req,res,next)=>{
    res.render('admin/add-product',{admin:true})
  })
  router.post('/add-product',(req,res)=>{
    // console.log(req.body)
    // console.log(req.files.Image)
    productHelpers.addProduct(req.body,(id)=>{
      let image=req.files.Image
      image.mv('./public/product-images/'+id+'.jpg',(err)=>{
        if(!err){
          res.render("admin/add-product",{admin:true})
        }
        else{
          console.log(err)
        }
      })
    })
  })
  router.get('/delete-product/:id',(req,res)=>{
    productHelpers.deleteProduct(req.params.id).then((response)=>{
      console.log(response)
      res.redirect("/admin/")
      if(req.files.Image){
        let image=req.files.Image
      image.mv('./public/product-images/'+id+'.jpg')
      }
    })
  }) 
  router.get('/edit-product/:id',async(req,res)=>{
    let product = await productHelpers.getProductDetails(req.params.id)
    res.render('admin/edit-product',{product,admin:true})
  })
  router.post('/edit-product/:id',(req,res)=>{
    productHelpers.updateProduct(req.params.id,req.body).then(()=>{
      res.redirect('/admin/')
      if(req.files.Image){
        let image=req.files.Image
        image.mv('./public/product-images/'+req.params.id+'.jpg')
      }
    })
  })
  router.get('/users',(req,res)=>{
    userHelpers.getAllUsers().then((users)=>{
      res.render('admin/all-users',{users,admin:true})
    })
  })
  router.get('/orders',(req,res)=>{
   orderHelpers.getAllOrders().then((orders)=>{
    orders.forEach(order => {
  order.formattedDate = new Date(order.date).toLocaleDateString('en-GB'); // DD/MM/YYYY
});
    res.render('admin/all-orders',{orders,admin:true})
   })
  })
  router.post('/update-order-status', async (req, res) => {
  const { orderId, status } = req.body;
  try {
    await orderHelpers.updateOrderStatus(orderId, status);  // 
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});
module.exports = router;

