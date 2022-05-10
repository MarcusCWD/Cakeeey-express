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

// READ all possible product variant combination
router.get('/cakes', async(req,res)=>{
    let q = Cake.collection();
    const allCakes = await q.fetch({
        require: false,
        withRelated: ["season"]
    })
    res.send(allCakes)
})

// READ the search results for the base cakes
// use the base cake data because we will not want the duplication of cakes
// can do a comparision on the front end with the products
router.get("/search", async (req, res) => {
    let checkSeason = Cake.collection();
    let queryName = Cake.collection();
    let querySeason = Season.collection();
    let searchCake2 = [];
    let searchCake1 = [];
    let arrSearchCake2 = [];
    let arrSearchCake1 = [];

    // first query the season name
    if (req.query.season) {
        querySeason = querySeason.where("name", "like", "%" + req.query.season + "%")
    }
    const searchSeason = await querySeason.fetch({
        require: false,
    })

    // check if there is any season item
    if (searchSeason.length !== 0){
        // if so happen to have multiple seasons, pick the first one
        seasonIndex = searchSeason.toJSON()[0].id
        checkSeason = checkSeason.where("season_id", "=" , seasonIndex)
        
        // this is the list of all the cakes that matches the season id
        searchCake2 = await checkSeason.fetch({
            require: false,
            withRelated: ["season", "ingredients"]
        })
        arrSearchCake2 = searchCake2.toJSON()
    }


    // if the input field not empty
    if (req.query.name) {
        queryName = queryName.where("name", "like", "%" + req.query.name + "%") 
    }
    searchCake1 = await queryName.fetch({
        require: false,
        withRelated: ["season", "ingredients"]
    })

    // check if the id exists in search cake 1
    // if we found the id in search cake 1
    // we delete
    arrSearchCake1 = searchCake1.toJSON()

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


// READ all possible product variant combination
router.get('/seasons', async(req,res)=>{
    let q = Season.collection();
    const allSeason = await q.fetch({
        require: false,
        withRelated: ["cakes"]
    })
    res.send(allSeason)
})

module.exports = router;
