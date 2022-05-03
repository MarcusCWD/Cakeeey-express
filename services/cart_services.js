const cartDataLayer = require("../dal/cart_items");

class CartServices {
  constructor(user_id) {
    this.user_id = user_id;
  }

  async getCart() {
    return await cartDataLayer.allCart(this.user_id);
  }

  async addToCart(productId, quantity) {
    //add in the BUSNESS RULES HERE
    let cartItem = await cartDataLayer.allCartItemByUserAndProduct(
      this.user_id,
      productId
    );

    // check if the user has added the product to the shopping cart before
    if (cartItem) { // if this item already exist within database, then qty +1
      return await cartDataLayer.updateQuantity(
        this.user_id,
        productId,
        cartItem.get("quantity") + quantity
      );
    } else { // if not, this item is new. so we need to create and add it to the database
      let newCartItem = cartDataLayer.createCartItem(
        this.user_id,
        productId,
        quantity
      );
      return newCartItem;
    }
  }

  async remove(productId) {
    return await cartDataLayer.removeFromCart(this.user_id, productId);
  }

  async setQuantity(productId, newQuantity) {
    return await cartDataLayer.updateQuantity(
      this.user_id,
      productId,
      newQuantity
    );
  }
}

module.exports = CartServices;
