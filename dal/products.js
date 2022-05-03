// import in the Product model
const { Cake, Cakesize } = require('../models');

async function allCakes() {
    return await Cake.fetchAll().map((cake) => {
      return [cake.get("id"), cake.get("name")];
    });
  }
  async function allSize() {
    return await Cakesize.fetchAll().map((size) => {
      return [size.get("id"), size.get("size")];
    });
  }


module.exports = {
    allCakes, allSize
}
