const Cart = require("../models/cart");
const Listing = require("../models/listing");

// Get user's cart
module.exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.product",
      select: "title price image",
    });

    if (!cart) {
      cart = { items: [], totalAmount: 0 };
    }

    res.render("cart/show", { cart });
  } catch (err) {
    req.flash("error", "Failed to retrieve cart");
    res.redirect("/products");
  }
};

// Add item to cart
module.exports.addToCart = async (req, res) => {
  try {
    const { id } = req.params;
    const quantity = parseInt(req.body.quantity) || 1;

    // Find the product
    const product = await Listing.findById(id);
    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/products");
    }

    // Find user's cart or create a new one
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === id
    );

    if (existingItemIndex > -1) {
      // Update quantity if product already in cart
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        product: id,
        quantity: quantity,
        price: product.price,
      });
    }

    await cart.save();
    req.flash("success", "Product added to cart");
    res.redirect(`/products/${id}`);
  } catch (err) {
    req.flash("error", "Failed to add item to cart");
    res.redirect("/products");
  }
};

// Update cart item quantity
module.exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      req.flash("error", "Quantity must be at least 1");
      return res.redirect("/cart");
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      req.flash("error", "Cart not found");
      return res.redirect("/products");
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === id
    );

    if (itemIndex === -1) {
      req.flash("error", "Item not found in cart");
      return res.redirect("/cart");
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    req.flash("success", "Cart updated successfully");
    res.redirect("/cart");
  } catch (err) {
    req.flash("error", "Failed to update cart");
    res.redirect("/cart");
  }
};

// Remove item from cart
module.exports.removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      req.flash("error", "Cart not found");
      return res.redirect("/products");
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== id);

    await cart.save();

    req.flash("success", "Item removed from cart");
    res.redirect("/cart");
  } catch (err) {
    req.flash("error", "Failed to remove item from cart");
    res.redirect("/cart");
  }
};

// Clear cart
module.exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    req.flash("success", "Cart cleared successfully");
    res.redirect("/cart");
  } catch (err) {
    req.flash("error", "Failed to clear cart");
    res.redirect("/cart");
  }
};
