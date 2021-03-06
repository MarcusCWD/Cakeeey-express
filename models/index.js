const bookshelf = require('../bookshelf')

const Cake = bookshelf.model('Cake', {
    tableName:'cakes',
    season(){
        return this.belongsTo('Season')
    },
    ingredients(){
        return this.belongsToMany('Ingredient')
    },
    products(){
        return this.hasMany('Product')
    }
});
const Season = bookshelf.model('Season', {
    tableName:'seasons',
    cakes(){
        return this.hasMany('Cake')
    }
});
const Ingredient = bookshelf.model('Ingredient',{
    tableName: 'ingredients',
    cakes() {
        return this.belongsToMany('Cake')
    }
});
const Product = bookshelf.model('Product', {
    tableName:'products',
    cakesize(){
        return this.belongsTo('Cakesize')
    },
    cake(){
        return this.belongsTo('Cake')
    },
    cartitems(){
        return this.hasMany('Cartitem')
    },
    purchases(){
        return this.hasMany('Purchase')
    }
});
const Cakesize = bookshelf.model('Cakesize', {
    tableName:'cakesizes',
    products(){
        return this.hasMany('Product')
    }
});
const User = bookshelf.model('User',{
    tableName: 'users',
    cartitems(){
        return this.hasMany('Cartitem')
    },
    orders(){
        return this.hasMany('Order')
    },
    purchases(){
        return this.hasMany('Purchase')
    }
});
const Cartitem = bookshelf.model('Cartitem', {
    tableName: 'cart_items',
    product() {
        return this.belongsTo('Product')
    }
})
const Order = bookshelf.model('Order', {
    tableName: 'orders',
    users(){
        return this.belongsTo('User')
    },
    status(){
        return this.belongsTo('Status')
    },
    purchases(){
        return this.hasMany('Purchase')
    }
})
const Status = bookshelf.model('Status', {
    tableName:'statuses',
    orders(){
        return this.hasMany('Order')
    }
});
const Purchase = bookshelf.model('Purchase', {
    tableName:'purchases',
    user(){
        return this.belongsTo('User')
    },
    product(){
        return this.belongsTo('Product')
    },
    order(){
        return this.belongsTo('Order')
    },
});

const BlacklistedToken = bookshelf.model('BlacklistedToken',{
    tableName: 'blacklisted_tokens'
})





module.exports = { Cake, Season, Ingredient, Product, Cakesize, User, Cartitem, Order, Purchase, BlacklistedToken, Status };
