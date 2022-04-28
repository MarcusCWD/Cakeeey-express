const express = require("express");
const router = express.Router();
const { Cake, Product, Cakesize } = require("../models");
const { bootstrapField, createProductForm } = require("../forms");

async function allCakes() {
  return await Cake.fetchAll().map((cake) => {
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
    withRelated: ["cake.season", "cakesize", "cake.ingredients"],
  });
  res.render("products/index.hbs", {
    products: products.toJSON(),
  });
});

// CRUD - CREATE
router.get("/create", async (req, res) => {
  const productForm = createProductForm(await allCakes(), await allSize());
  res.render("products/create.hbs", {
    form: productForm.toHTML(bootstrapField),
  });
});
router.post("/create", async (req, res) => {
  // during the post, there needs to be a check for repeated product for variation size
  let products = await Product.collection().fetch();
  const productForm = createProductForm(await allCakes(), await allSize());
  productForm.handle(req, {
    success: async (form) => {
      for (let oneProduct of products.toJSON()) {
        if (form.fields.cake_id.value == oneProduct.cake_id) {
          if (form.fields.cakesize_id.value == oneProduct.cakesize_id) {
            req.flash("error_messages", `This product already exist within the database`);
            res.redirect("/products/create");
            return;
          }
        }
      }
      const product = new Product(form.data);
      console.log(product.toJSON())
      await product.save();

      const fetchProduct = await Product.where({
        id: form.fields.cake_id.value,
      }).fetch({
        require: true,
        withRelated: ["cake", "cakesize"]
      });
      req.flash("success_messages", `New Product ${(fetchProduct.toJSON()).cake.name}, ${(fetchProduct.toJSON()).cakesize.size} has been created`)
      res.redirect("/products");
    },
    error: async (form) => {
      req.flash("error_messages", `Creation error. Try again`);
      res.render("products/create.hbs", {
        form: form.toHTML(bootstrapField),
      });
    },
  });
});

// CRUD - UPDATE
router.get("/:product_id/update", async (req, res) => {
  const productId = req.params.product_id;
  const product = await Product.where({
    id: productId,
  }).fetch({
    require: true,
  });

  const productForm = createProductForm(await allCakes(), await allSize());
  productForm.fields.cake_id.value = product.get("cake_id");
  productForm.fields.cakesize_id.value = product.get("cakesize_id");
  productForm.fields.price.value = product.get("price");
  res.render("products/update.hbs", {
    form: productForm.toHTML(bootstrapField),
    product: product,
  });
});
router.post("/:product_id/update", async (req, res) => {
  // during the post, there needs to be a check for repeated product for variation size
  let products = await Product.collection().fetch();
  const product = await Product.where({
    id: req.params.product_id,
  }).fetch({
    required: true,
  });
  const productForm = createProductForm(await allCakes(), await allSize());
  productForm.handle(req, {
    success: async (form) => {
      for (let oneProduct of products.toJSON()) {
        if (form.fields.cake_id.value == oneProduct.cake_id) {
          if (form.fields.cakesize_id.value == oneProduct.cakesize_id) {
            req.flash("error_messages", `This product is already existing within database`);
            res.redirect("/products");
            return;
          }
        }
      }
      product.set(form.data);
      product.save();
      req.flash("success_messages", `Product has been updated`);
      res.redirect("/products");
    },
    error: async (form) => {
      req.flash("error_messages", `Update error. Try again`);
      res.render("products/update", {
        form: form.toHTML(bootstrapField),
      });
    },
  });
});

// CRUD - DELETE
router.get("/:product_id/delete", async (req, res) => {
  // fetch the product that we want to delete
  const product = await Product.where({
    id: req.params.product_id,
  }).fetch({
    require: true,
  });
  res.render("products/delete.hbs", {
    product: product.toJSON(),
  });
});
router.post("/:product_id/delete", async (req, res) => {
  const product = await Product.where({
    id: req.params.product_id,
  }).fetch({
    require: true,
    withRelated: ["cake", "cakesize"]
  });
  await product.destroy();
  req.flash("success_messages", `Product ${(product.toJSON()).cake.name}, ${(product.toJSON()).cakesize.size}cm has been deleted`);
  res.redirect("/products");
});

module.exports = router;
