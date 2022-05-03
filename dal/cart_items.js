const { Cartitem } = require("../models");

const allCart = async (userId) => {
  return await Cartitem.collection()
    .where({
      user_id: userId,
    })
    .fetch({
      require: false,
      withRelated: ["product", "product.cake"],
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
    let cartItem = await getCartItemByUserAndProduct(userId, productId);
    if (cartItem) {
        cartItem.set('quantity', newQuantity);
        cartItem.save();
        return true;
    }
    return false;
}



module.exports = { allCart, allCartItemByUserAndProduct, createCartItem, removeFromCart, updateQuantity  };
