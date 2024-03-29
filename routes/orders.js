const express = require("express");
const router = express.Router();
const { checkIfAuthenticated } = require("../middlewares");
// import in the Order model
const { Order } = require('../models');
const { bootstrapField, createOrderForm } = require("../forms");

// import in the DAL
const dataLayer = require('../dal/orders')

// this route is used for the view of all users
router.get('/',checkIfAuthenticated, async (req,res)=>{
    let orders = await Order.collection().where({
        // status_id: 3
    }).fetch({
        withRelated: ["status", "purchases", "purchases.product", "purchases.product.cakesize", "purchases.product.cake"]
    });
      res.render("orders/index.hbs", {
        'orders': orders.toJSON(),
      });
})

// CRUD - UPDATE
router.get("/:order_id/update",checkIfAuthenticated, async (req, res) => {
  const orderId = req.params.order_id;
  const order = await Order.where({
    id: orderId,
  }).fetch({
    require: true,
  });

  const orderForm = createOrderForm(await dataLayer.allStatus());
  orderForm.fields.status_id.value = order.get("status_id");
  orderForm.fields.address.value = order.get("address");
  res.render("orders/update.hbs", {
    'form': orderForm.toHTML(bootstrapField),
    'order': order,
  });
});

router.post("/:order_id/update", async (req, res) => {
  const order = await Order.where({
    id: req.params.order_id,
  }).fetch({
    required: true,
  });
  const orderForm = createOrderForm(await dataLayer.allStatus());
  orderForm.handle(req, {
    success: async (form) => {
      let formStore = {status_id: parseInt(form.data.status_id), address: form.data.address }
      order.set(formStore);
      order.save();
      req.flash("success_messages", `Order has been updated`);
      res.redirect("/cakeeeyadmin/orders");
    },
    error: async (form) => {
      req.flash("error_messages", `Update error. Try again`);
      res.render("orders/update", {
        form: form.toHTML(bootstrapField),
      });
    },
  });
});


module.exports = router;
