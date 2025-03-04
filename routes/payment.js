const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware.js");
const paymentController = require("../controllers/payment.js");
const wrapAsync = require("../utils/wrapAsync.js");

// Log middleware for debugging
router.use((req, res, next) => {
  console.log(`Payment route accessed: ${req.method} ${req.url}`);
  next();
});

// Body parsing middleware for payment routes
router.use(express.json());

// Middleware to log request bodies
router.use((req, res, next) => {
  if (req.method === "POST") {
    console.log("Payment route request body:", req.body);
  }
  next();
});

// Checkout page
router.get(
  "/checkout",
  isLoggedIn,
  wrapAsync(paymentController.renderCheckout)
);

// Create payment intent
router.post(
  "/create-payment-intent",
  isLoggedIn,
  wrapAsync(paymentController.createPaymentIntent)
);

// Process payment
router.post(
  "/process-payment",
  isLoggedIn,
  wrapAsync(paymentController.processPayment)
);

// Payment success
router.get("/success", isLoggedIn, wrapAsync(paymentController.paymentSuccess));

// Payment cancel
router.get("/cancel", isLoggedIn, paymentController.paymentCancel);

// Order history
router.get("/orders", isLoggedIn, wrapAsync(paymentController.orderHistory));

// View single order
router.get("/orders/:id", isLoggedIn, wrapAsync(paymentController.viewOrder));

// Error handler for payment routes
router.use((err, req, res, next) => {
  console.error("Payment route error:", err);
  res.status(500).json({
    error: err.message || "An error occurred during payment processing",
  });
});

module.exports = router;
