const express = require('express');
const { checkIfAuthenticated } = require('../../middlewares');
const router = express.Router();
const { User, Order, Purchase } = require("../../models")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

const CartServices = require('../../services/cart_services')


router.get('/',checkIfAuthenticated, async (req, res) => {
    const cart = new CartServices(req.session.user.id);
    // get all the items from the cart
    let items = await cart.getCart();

    // Create a new row in Order with status 1 (Processing)
    const newOrder = new Order()
    let user = await User.where({
        "id": req.session.user.id
    }).fetch()

    newOrder.set("user_id", user.get("id"))
    newOrder.set("status_id", "1")
    newOrder.set("date", new Date())
    newOrder.set("firstname", user.get("firstname"))
    newOrder.set("lastname", user.get("lastname"))
    newOrder.set("address",  user.get("address"))
    newOrder.set("totalprice", 0)
    await newOrder.save()

    // step 1 - create line items
    let lineItems = [];
    let meta = [];
    for (let item of items) {
        const lineItem = {
            'name': item.related('product').related('cake').get('name'),
            'amount': item.related('product').get('price'),
            'quantity': item.get('quantity'),
            'currency': 'SGD'
        }
        if (item.related('product').related('cake').get('image_url')) {
            lineItem['images'] = [item.related('product').related('cake').get('image_url')]
        }
        lineItems.push(lineItem);
        // save the quantity data along with the product id
        meta.push({
            'product_id' : item.get('product_id'),
            'quantity': item.get('quantity'),
            "user_id": user.get("id")
        })
    }

    // step 2 - create stripe payment
    let metaData = JSON.stringify(meta);
    const payment = {
        payment_method_types: ['card'],
        line_items: lineItems,
        success_url: process.env.STRIPE_SUCCESS_URL,
        cancel_url: process.env.STRIPE_ERROR_URL,
        metadata: {
            'orders': metaData
        }
    }

    // step 3: register the session
    let stripeSession = await stripe.checkout.sessions.create(payment)
    res.render('checkout/checkout', {
        'sessionId': stripeSession.id, // 4. Get the ID of the session
        'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
    })
})

// POST FOR STRIPE TO RETRIEVE DATA VIA WEBHOOK
router.post("/process_payment", express.raw({ type: "application/json" }), async (req, res) => {
    let payload = req.body
    let endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
    let sigHeader = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe.webhooks.constructEvent(payload, sigHeader, endpointSecret)
    } catch (e) {
        res.send({
            "error": e.message
        })
    }
    if (event.type == "checkout.session.completed") {
        //  Make metaData into JSON format for processing
        let items = event.data.object.metadata.orders
        items = JSON.parse(items)
        // Get user Details
        const user = await User.where({
            "id": items[0].user_id
        }).fetch({
            require: false
        })

        let user_id = user.get("id")
        // Change Order Details of the last item and add in cost + status to 2 (Paid)
        let selectedOrder = await Order.where({
            "user_id": user_id
        }).query(i => i.orderBy("id", "DESC").limit(1)).fetch()
        selectedOrder.set("totalprice", event.data.object.amount_total)
        selectedOrder.set("status_id", 2)
        await selectedOrder.save()
        // Add items to purchases table
        for (let item of items) {
            const newPurchase = new Purchase();
            newPurchase.set("product_id", item.product_id)
            newPurchase.set("quantity", item.quantity)
            newPurchase.set("order_id", selectedOrder.get("id"))
            newPurchase.set("user_id", selectedOrder.get("user_id"))
            newPurchase.save()
        }
        // Delete items from cart
        // Find all items that matches
        const cartServices = new CartServices(user_id)
        for (let item of items) {
            await cartServices.remove(item.product_id)
        }


    }
    res.sendStatus(200);
})

router.get('/success', async (req,res)=>{
      res.render("checkout/success.hbs", {
      });
})
router.get('/error', async (req,res)=>{
    res.render("checkout/cancelled.hbs", {
    });
})
module.exports = router;
