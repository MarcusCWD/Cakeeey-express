const { Cartitem } = require("../models");

const allCart = async (userId) => {
  return await Cartitem.collection()
    .where({
      user_id: userId,
    })
    .fetch({
      require: false,
      withRelated: ["product", "product.cake", "product.cake.season", "product.cakesize"],
    });
};
const allCartItemByUserAndProduct = async (userId, productId) => {
  return await Cartitem.where({
    user_id: userId,
    product_id: productId,
  }).fetch({
    require: false,
  });
};
async function createCartItem(userId, productId, quantity) {
  let cartitem = new Cartitem({
    user_id: userId,
    product_id: productId,
    quantity: quantity,
  });
  await cartitem.save();
  return cartitem;
}
async function removeFromCart(userId, productId) {
    let cartitem = await allCartItemByUserAndProduct(userId, productId);
    if (cartitem) {
        await cartitem.destroy();
        return true;
    }
    return false;
}
async function updateQuantity(userId, productId, newQuantity) {
    let cartitem = await allCartItemByUserAndProduct(userId, productId);
    if (cartitem) {
        cartitem.set('quantity', newQuantity);
        await cartitem.save();
        return true;
    }
    return false;
}



module.exports = { allCart, allCartItemByUserAndProduct, createCartItem, removeFromCart, updateQuantity  };
