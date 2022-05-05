const express = require("express");
const router = express.Router();
const { checkIfAuthenticated } = require("../middlewares");
// import in the Order model
const { Order } = require('../models');

// this route is used for the view of all users
router.get('/',checkIfAuthenticated, async (req,res)=>{
    let orders = await Order.collection().where({
        status_id: 2 || 3 || 4 || 5
    }).fetch({
        withRelated: ["status", "purchases", "purchases.product", "purchases.product.cakesize", "purchases.product.cake"]
    });
    console.log((orders.toJSON())[0].purchases[0])
      res.render("orders/index.hbs", {
        'orders': orders.toJSON(),
      });
})


module.exports = router;
