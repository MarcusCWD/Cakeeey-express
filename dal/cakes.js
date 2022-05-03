// import in the Product model
const { Season, Ingredient } = require('../models');

async function allSeasons() {
    return await Season.fetchAll().map((season) => {
      return [season.get("id"), season.get("name")];
    });
  }
  async function allIngredients() {
    return await Ingredient.fetchAll().map((ingredient) => {
      return [ingredient.get("id"), ingredient.get("name")];
    });
  }


module.exports = {
    allSeasons, allIngredients
}
