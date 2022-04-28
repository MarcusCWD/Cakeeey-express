const express = require("express");
const router = express.Router();
const { Cake, Product, Cakesize } = require("../models");
const { bootstrapField, createProductForm } = require('../forms');

async function allCakes() {
  return await Cake.fetchAll({
  }).map((cake) => {
    return [cake.get("id"), cake.get("name")];
  });
}
async function allSize() {
  return await Cakesize.fetchAll().map((size) => {
    return [size.get("id"), size.get("size")];
  });
}


// CRUD - READ
router.get("/", async (req, res) => {
  let products = await Product.collection().fetch({
    withRelated:['cake.season', 'cakesize', 'cake.ingredients'],
  });
  console.log((products.toJSON()))
  res.render("products/index.hbs", {
    'products': products.toJSON()
  });
});

// CRUD - CREATE
router.get('/create', async (req, res) => {
  const productForm = createProductForm(await allCakes(), await allSize())
  res.render('products/create.hbs',{
      'form': productForm.toHTML(bootstrapField)
  })
})
// router.post('/create', async(req,res)=>{
//   const cakeForm = createCakeForm(await allSeasons());
//   cakeForm.handle(req, {
//       'success': async (form) => {
//         let {ingredients, ...cakeData} = form.data;
//         const cake = new Cake(cakeData);
//         await cake.save();
//         if (ingredients) {
//           await cake.ingredients().attach(ingredients.split(","));
//         }
//           res.redirect('/cakes');
//       },
//       'error': async (form) => {
//         res.render('cakes/create.hbs', {
//             'form': form.toHTML(bootstrapField)
//         })
//     }
//   })
// })

module.exports = router;
