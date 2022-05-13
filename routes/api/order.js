const express = require("express")
const router = express.Router()
const { Order, Purchase } = require("../../models")
const { checkIfAuthenticatedJWT } = require("../../middlewares");

// we can get the user order id from this route
router.get("/:user_id/user", async (req, res) => {
    let userId = req.params.user_id
    if(!userId){
        res.send("Nothing")
    }
    
    let orders = await Order.where({
        "user_id": userId,
    }).fetchAll({
        require: false,
        withRelated: ["purchases","purchases.status",  "purchases.product", "purchases.product.cake", "purchases.product.cakesize"]
    })
    if (orders) {
        res.send(orders)
    } else {
        res.send("No Orders")
    }
})

// when we get the user order id, we place them into this route
// such that we can retrive the individual products of the order
router.get("/:order_id/order", async (req, res) => {
    let orderId = req.params.order_id
    let purchases = await Purchase.where({
        "order_id": orderId
    }).fetchAll({
        require: false,
        withRelated: ["product", "product.cakesize", "product.cake"]
    })
    res.send(purchases)
})
module.exports = router