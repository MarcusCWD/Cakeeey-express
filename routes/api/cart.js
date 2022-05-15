const express = require("express")
const router = express.Router();
// const { Cartitem } = require("../../models")
const CartServices = require("../../services/cart_services")
const { checkIfAuthenticatedJWT } = require("../../middlewares");


// READ all the cartitems based on the user_id
// this route will be ran everytime we do a post such that
// we can get back the UPDATED version of the data base
router.get("/:user_id", async (req, res) => {
    let cartServices = new CartServices(req.params.user_id)
    try {
        const cartItems = await cartServices.getCart()
        res.status(200)
        res.send(cartItems.toJSON())
    } catch (e) {
        res.status(500)
        res.send("Unable to get all items.")
    }
})

//CREATE item into user's shopping cart
//note that the internal function addToCart has the update and create function
router.post("/:user_id/:product_id/add", async (req, res) => {
    let cartServices = new CartServices(req.params.user_id)
    try {
        await cartServices.addToCart(req.params.product_id, 1)
        res.status(200)
        res.send("Item added.")
    } catch (e) {
        res.status(204)
        res.send("Item not found.")
    }
})

// UPDATE qty of item
router.post("/:user_id/:product_id/:qty/update", async (req, res) => {
    let cartServices = new CartServices(req.params.user_id);
    try{
        await cartServices.setQuantity(req.params.product_id, req.body.qty);
        res.status(200)
        res.send("Item quantity updated.")
    }catch(e){
        res.status(204)
        res.send("Item not found.")
    }
  });

// DESTROY item in cart for user
router.post("/:user_id/:product_id/delete", async (req, res) => {
    let cartServices = new CartServices(req.params.user_id)
    try {
        await cartServices.remove(req.params.product_id)
        res.status(200)
        res.send("Item removed from cart.")
    } catch (e) {
        res.status(204)
        res.send("Item not found.")
    }
})


module.exports = router; 