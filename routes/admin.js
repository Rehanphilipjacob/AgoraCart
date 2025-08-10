var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');

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
module.exports = router;

