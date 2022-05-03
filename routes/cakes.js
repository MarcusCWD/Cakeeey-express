const express = require("express");
const router = express.Router();
const { Cake, Season, Ingredient } = require("../models");
const {
  bootstrapField,
  createCakeForm,
  createSearchForm,
} = require("../forms");

const { checkIfAuthenticated } = require("../middlewares");

// import in the DAL
const dataLayer = require('../dal/cakes')

router.get("/", checkIfAuthenticated, async (req, res) => {
  let xSeasons = await dataLayer.allSeasons();
  xSeasons.unshift([0, "ALL"]);
  let searchForm = createSearchForm(xSeasons, await dataLayer.allIngredients());
  let q = Cake.collection();

  searchForm.handle(req, {
    empty: async (form) => {
      let cakes = await q.fetch({
        withRelated: ["season", "ingredients"],
      });
      res.render("cakes/index.hbs", {
        cakes: cakes.toJSON(),
        form: form.toHTML(bootstrapField),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
      });
    },
    error: async (form) => {
      let cakes = await q.fetch({
        withRelated: ["season", "ingredients"],
      });
      res.render("products/index", {
        cakes: cakes.toJSON(),
        form: form.toHTML(bootstrapField),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
      });
    },
    success: async (form) => {
      if (form.data.name) {
        q = q.where("name", "like", "%" + req.query.name + "%");
      }

      if (form.data.season_id && form.data.season_id != "0") {
        q = q
          .where("season_id", "=", form.data.season_id);
      }

      if (form.data.ingredients) {
        q.query("join", "cakes_ingredients", "cakes.id", "cake_id").where(
          "ingredient_id",
          "in",
          form.data.ingredients.split(",")
        );
      }

      let cakes = await q.fetch({
        withRelated: ["season", "ingredients"],
      });
      res.render("cakes/index", {
        cakes: cakes.toJSON(),
        form: form.toHTML(bootstrapField),
      });
    },
  });
});

// CRUD - CREATE
router.get("/create", checkIfAuthenticated, async (req, res) => {
  const cakeForm = createCakeForm(await dataLayer.allSeasons(), await dataLayer.allIngredients());
  res.render("cakes/create.hbs", {
    form: cakeForm.toHTML(bootstrapField),
    cloudinaryName: process.env.CLOUDINARY_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
  });
});
router.post("/create", async (req, res) => {
  // need to check for the repeated name of base cake
  let cakes = await Cake.collection().fetch();
  const cakeForm = createCakeForm(await dataLayer.allSeasons(), await dataLayer.allIngredients());
  cakeForm.handle(req, {
    success: async (form) => {
      for (let oneCake of cakes.toJSON()) {
        if (form.fields.name.value == oneCake.name) {
          req.flash(
            "error_messages",
            `${form.fields.name.value} base cake already exist within the database`
          );
          res.redirect("/cakes/create");
          return;
        }
      }
      let { ingredients, ...cakeData } = form.data;
      const cake = new Cake(cakeData);
      await cake.save();
      if (ingredients) {
        await cake.ingredients().attach(ingredients.split(","));
      }
      req.flash(
        "success_messages",
        `New Cake base ${cake.toJSON().name} has been created`
      );
      res.redirect("/cakes");
    },
    error: async (form) => {
      req.flash("error_messages", `Creation error. Try again`);
      res.render("cakes/create.hbs", {
        form: form.toHTML(bootstrapField),
      });
    },
  });
});

// CRUD - UPDATE
router.get("/:cake_id/update", checkIfAuthenticated, async (req, res) => {
  // retrieve the product
  const cakeId = req.params.cake_id;
  const cake = await Cake.where({
    id: parseInt(cakeId),
  }).fetch({
    require: true,
    withRelated: ["ingredients"],
  });

  const cakeForm = createCakeForm(await dataLayer.allSeasons(), await dataLayer.allIngredients());
  cakeForm.fields.name.value = cake.get("name");
  cakeForm.fields.waittime.value = cake.get("waittime");
  cakeForm.fields.description.value = cake.get("description");
  cakeForm.fields.season_id.value = cake.get("season_id");
  cakeForm.fields.image_url.value = cake.get("image_url");

  // fill in the multi-select for the tags
  let selectedIngredients = await cake.related("ingredients").pluck("id"); // an array of id values of ingredients
  cakeForm.fields.ingredients.value = selectedIngredients;

  res.render("cakes/update.hbs", {
    form: cakeForm.toHTML(bootstrapField),
    cake: cake.toJSON(),
    cloudinaryName: process.env.CLOUDINARY_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
  });
});
router.post("/:cake_id/update", async (req, res) => {
  const cake = await Cake.where({
    id: req.params.cake_id,
  }).fetch({
    require: true,
    withRelated: ["ingredients"],
  });

  const cakeForm = createCakeForm(await dataLayer.allSeasons(), await dataLayer.allIngredients());
  cakeForm.handle(req, {
    success: async (form) => {
      let { ingredients, ...cakeData } = form.data;
      cake.set(cakeData);
      cake.save();

      let ingredientIds = ingredients.split(",");
      let existingIngredientIds = await cake.related("ingredients").pluck("id"); // an array of id values of ingredients

      let toRemove = existingIngredientIds.filter(
        (id) => ingredientIds.includes(id) === false
      );
      await cake.ingredients().detach(toRemove);

      await cake.ingredients().attach(ingredientIds);
      req.flash(
        "success_messages",
        `New Cake base ${cake.toJSON().name} has been updated`
      );
      res.redirect("/cakes");
    },
    error: async (form) => {
      req.flash("error_messages", `Creation error. Try again`);
      res.render("cakes/update", {
        form: form.toHTML(bootstrapField),
      });
    },
  });
});
// CRUD - DELETE
router.get("/:cake_id/delete", checkIfAuthenticated, async (req, res) => {
  // fetch the product that we want to delete
  const cake = await Cake.where({
    id: req.params.cake_id,
  }).fetch({
    require: true,
  });

  res.render("cakes/delete", {
    cake: cake.toJSON(),
  });
});
router.post("/:cake_id/delete", async (req, res) => {
  // fetch the product that we want to delete
  const cake = await Cake.where({
    id: req.params.cake_id,
  }).fetch({
    require: true,
  });
  await cake.destroy();
  req.flash("success_messages", `Cake has been deleted`);
  res.redirect("/cakes");
});

module.exports = router;
