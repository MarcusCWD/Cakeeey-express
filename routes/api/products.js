const express = require('express')
const router = express.Router();
const { Product, Cake, Season } = require("../../models")

// READ all possible product variant combination
router.get('/', async(req,res)=>{
    let q = Product.collection();
    const allProducts = await q.fetch({
        require: false,
        withRelated: ["cake.season", "cake", "cake.ingredients"]
    })
    res.send(allProducts)
})

// READ the search results for the base cakes
// use the base cake data because we will not want the duplication of cakes
// can do a comparision on the front end with the products
router.get("/search", async (req, res) => {
    let q1 = Cake.collection();
    let q2 = Cake.collection();
    let k = Season.collection()

    // first query the season name
    if (req.query.season) {
        k = k.where("name", "like", "%" + req.query.season + "%")
    }
    const searchSeason = await k.fetch({
        require: false,
    })

    // extract out the season id
    seasonIndex = searchSeason.toJSON()[0].id
    if (seasonIndex) {
        q1 = q1.where("season_id", "=" , seasonIndex)
    }
    // this is the list of all the cakes that matches the season id
    const searchCake2 = await q1.fetch({
        require: false,
        withRelated: ["season", "ingredients"]
    })
    arrSearchCake2 = searchCake2.toJSON()
    console.log("This is the result of the season search", arrSearchCake2)

    // if the input field not empty
    if (req.query.name) {
        q2 = q2.where("name", "like", "%" + req.query.name + "%") 
    }
    const searchCake1 = await q2.fetch({
        require: false,
        withRelated: ["season", "ingredients"]
    })

    // check if the id exists in search cake 1
    // if we found the id in search cake 1
    // we delete
    arrSearchCake1 = searchCake1.toJSON()
    console.log("This is the result of the cake name search", arrSearchCake1)

    // for all items in search cake 2
    for (let i of arrSearchCake2) {
        for (let j =0; j<arrSearchCake1.length; j++) {
            if (arrSearchCake1[j].id == i.id) {
                arrSearchCake1.splice(j,1)
            }
        }
    }
    res.send([...arrSearchCake1,...arrSearchCake2])
})

module.exports = router;
