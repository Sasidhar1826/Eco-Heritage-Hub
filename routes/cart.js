const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware.js");
const cartController = require("../controllers/cart.js");
const wrapAsync = require("../utils/wrapAsync.js");

// View cart
router.get("/", isLoggedIn, wrapAsync(cartController.getCart));

// Add item to cart
router.post("/add/:id", isLoggedIn, wrapAsync(cartController.addToCart));

// Update cart item quantity
router.put("/update/:id", isLoggedIn, wrapAsync(cartController.updateCartItem));

// Remove item from cart
router.delete(
  "/remove/:id",
  isLoggedIn,
  wrapAsync(cartController.removeFromCart)
);

// Clear cart
router.delete("/clear", isLoggedIn, wrapAsync(cartController.clearCart));

module.exports = router;
