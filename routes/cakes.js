const express = require("express");
const router = express.Router();
const { Cake, Season, Ingredient } = require("../models");
const { bootstrapField, createCakeForm } = require('../forms');

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
router.get("/", async (req, res) => {
  let cakes = await Cake.collection().fetch({
    withRelated:['season', 'ingredients'],
  });
  res.render("cakes/index.hbs", {
    'cakes': cakes.toJSON(),
    'ingredients': ((cakes.toJSON())[0].ingredients[0])
  });
});

// CRUD - CREATE
router.get('/create', async (req, res) => {
  const cakeForm = createCakeForm(await allSeasons(), await allIngredients())
  res.render('cakes/create.hbs',{
      'form': cakeForm.toHTML(bootstrapField)
  })
})
router.post('/create', async(req,res)=>{
  const cakeForm = createCakeForm(await allSeasons());
  cakeForm.handle(req, {
      'success': async (form) => {
        let {ingredients, ...cakeData} = form.data;
        const cake = new Cake(cakeData);
        await cake.save();
        if (ingredients) {
          await cake.ingredients().attach(ingredients.split(","));
        }
          res.redirect('/cakes');
      },
      'error': async (form) => {
        res.render('cakes/create.hbs', {
            'form': form.toHTML(bootstrapField)
        })
    }
  })
})

module.exports = router;
