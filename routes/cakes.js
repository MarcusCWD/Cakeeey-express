const express = require("express");
const router = express.Router();
const { Cake, Season, Ingredient } = require("../models");
const { bootstrapField, createCakeForm } = require('../forms');

const { checkIfAuthenticated } = require('../middlewares');

async function allSeasons() {
  return await Season.fetchAll().map((season) => {
    return [season.get("id"), season.get("name")];
  });
}
async function allIngredients() {
  return await Ingredient.fetchAll().map((ingredient) => {
    return [ingredient.get("id"), ingredient.get("name")];
  });
}

// CRUD - READ
router.get("/", checkIfAuthenticated, async (req, res) => {
  let cakes = await Cake.collection().fetch({
    withRelated:['season', 'ingredients'],
  });
  res.render("cakes/index.hbs", {
    'cakes': cakes.toJSON()
  });
});

// CRUD - CREATE
router.get('/create', checkIfAuthenticated, async (req, res) => {
  const cakeForm = createCakeForm( await allSeasons(), await allIngredients())
  res.render('cakes/create.hbs',{
      'form': cakeForm.toHTML(bootstrapField)
  })
})
router.post('/create', async(req,res)=>{
  // need to check for the repeated name of base cake
  let cakes = await Cake.collection().fetch();
  const cakeForm = createCakeForm(await allSeasons(), await allIngredients());
  cakeForm.handle(req, {
      'success': async (form) => {
        for (let oneCake of cakes.toJSON()) {
          if (form.fields.name.value == oneCake.name) {
              req.flash("error_messages", `${form.fields.name.value} base cake already exist within the database`);
              res.redirect("/cakes/create");
              return;
          }
        }
        let {ingredients, ...cakeData} = form.data;
        const cake = new Cake(cakeData);
        await cake.save();
        if (ingredients) {
          await cake.ingredients().attach(ingredients.split(","));
        }
        req.flash("success_messages", `New Cake base ${(cake.toJSON()).name} has been created`)
        res.redirect('/cakes');
      },
      'error': async (form) => {
        req.flash("error_messages", `Creation error. Try again`);
        res.render('cakes/create.hbs', {
            'form': form.toHTML(bootstrapField)
        })
    }
  })
})

// CRUD - UPDATE
router.get('/:cake_id/update', checkIfAuthenticated, async (req, res) => {
  // retrieve the product
  const cakeId = req.params.cake_id
  const cake = await Cake.where({
      'id': parseInt(cakeId)
  }).fetch({
      require: true,
      withRelated:['ingredients']
  });

  const cakeForm = createCakeForm(await allSeasons(), await allIngredients());
  cakeForm.fields.name.value = cake.get('name');
  cakeForm.fields.waittime.value = cake.get('waittime');
  cakeForm.fields.description.value = cake.get('description');
  cakeForm.fields.season_id.value = cake.get('season_id');

  // fill in the multi-select for the tags
  let selectedIngredients = await cake.related('ingredients').pluck('id'); // an array of id values of ingredients
  cakeForm.fields.ingredients.value= selectedIngredients; 

  res.render('cakes/update.hbs', {
      'form': cakeForm.toHTML(bootstrapField),
      'cake': cake.toJSON()
  })
})
router.post('/:cake_id/update', async (req, res) => {
  const cake = await Cake.where({
    'id': req.params.cake_id
  }).fetch({
    require: true,
    withRelated:['ingredients']
  });

  const cakeForm = createCakeForm();
  cakeForm.handle(req, {
      'success': async (form) => {
          let { ingredients, ...cakeData} = form.data;
          cake.set(cakeData);
          cake.save();
          
          let ingredientIds = ingredients.split(',');
          let existingIngredientIds = await cake.related('ingredients').pluck('id'); // an array of id values of ingredients

          let toRemove = existingIngredientIds.filter( id => ingredientIds.includes(id) === false);
          await cake.ingredients().detach(toRemove);

          await cake.ingredients().attach(ingredientIds);
          req.flash("success_messages", `New Cake base ${(cake.toJSON()).name} has been updated`)
          res.redirect('/cakes');
      },
      'error': async (form) => {
          req.flash("error_messages", `Creation error. Try again`);
          res.render('cakes/update', {
              'form': form.toHTML(bootstrapField)
          })
      }
  })
})
// CRUD - DELETE
router.get('/:cake_id/delete', checkIfAuthenticated, async(req,res)=>{
  // fetch the product that we want to delete
  const cake = await Cake.where({
      'id': req.params.cake_id
  }).fetch({
      require: true
  });

  res.render('cakes/delete', {
      'cake': cake.toJSON()
  })
})
router.post('/:cake_id/delete', async(req,res)=>{
  // fetch the product that we want to delete
  const cake = await Cake.where({
      'id': req.params.cake_id
  }).fetch({
      require: true
  });
  await cake.destroy();
  req.flash("success_messages", `Cake has been deleted`);
  res.redirect('/cakes')
})

module.exports = router;
