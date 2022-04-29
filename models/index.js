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

});
const Cakesize = bookshelf.model('Cakesize', {
    tableName:'cakesizes',
    products(){
        return this.hasMany('Product')
    }
});
const User = bookshelf.model('User',{
    tableName: 'users'
})







module.exports = { Cake, Season, Ingredient, Product, Cakesize, User };
