const express = require('express')
const router = express.Router();
const { Product, Cake } = require("../../models")

router.get('/', async(req,res)=>{
    let q = Product.collection();
    const allProducts = await q.fetch({
        require: false,
        withRelated: ["cake.season", "cake", "cake.ingredients"]
    })
    res.send(allProducts)
})

router.get("/search", async (req, res) => {
    let q = Cake.collection();
    // if the input field not empty
    if (req.query.name) {
        q = q.where("name", "like", "%" + req.query.name + "%") 
    }
    const searchCake = await q.fetch({
        require: false,
        // withRelated: ["cake.season", "cake", "cake.ingredients"]
    })
    res.send(searchCake)
})

module.exports = router;
