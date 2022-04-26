const bookshelf = require('../bookshelf')

const Cake = bookshelf.model('Cake', {
    tableName:'cakes',
    season(){
        return this.belongsTo('Season')
    },
    ingredients(){
        return this.belongsToMany('Ingredient')
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
})



module.exports = { Cake, Season, Ingredient };
