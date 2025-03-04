const {
  generatePaymentId,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
} = require("../config/payment");
const Cart = require("../models/cart");
const Order = require("../models/order");
const User = require("../models/user");

// Render checkout page s
module.exports.renderCheckout = async (req, res) => {
  try {
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.product",
      select: "title price image",
    });

    if (!cart || cart.items.length === 0) {
      req.flash("error", "Your cart is empty");
      return res.redirect("/cart");
    }

    res.render("payment/checkout", {
      user: req.user,
      cart,
    });
  } catch (err) {
    req.flash("error", "Failed to load checkout page");
    res.redirect("/cart");
  }
};

// Create payment intent
module.exports.createPaymentIntent = async (req, res) => {
  try {
    console.log("Create payment intent request received");

    // Get user's cart to calculate amount
    const cart = await Cart.findOne({ user: req.user._id });
    console.log("User cart found:", cart ? "Yes" : "No");

    if (!cart || cart.items.length === 0) {
      console.log("Cart is empty for user:", req.user._id);
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Generate a unique payment ID
    const paymentId = generatePaymentId();
    console.log("Generated payment ID:", paymentId);

    // Send the response with the payment ID
    return res.status(200).json({
      paymentId: paymentId,
      amount: cart.totalAmount,
    });
  } catch (err) {
    console.error("Error creating payment intent:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Process payment and create order
module.exports.processPayment = async (req, res) => {
  try {
    // Log the raw request body
    console.log("Payment processing started with raw body:", req.body);
    console.log("Request headers:", req.headers);

    // Check if body is empty or undefined
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log("Request body is empty or undefined");
      return res.status(400).json({ error: "Request body is empty" });
    }

    // Extract payment ID and method from request body
    const { paymentId, paymentMethod } = req.body;
    console.log("Extracted paymentId:", paymentId);
    console.log("Extracted paymentMethod:", paymentMethod);

    if (!paymentId) {
      console.log("Payment ID is missing in request");
      return res.status(400).json({ error: "Payment ID is required" });
    }

    if (!paymentMethod) {
      console.log("Payment method is missing, using default");
    }

    const finalPaymentMethod = paymentMethod || PAYMENT_METHODS.CUSTOM;
    console.log("Using payment method:", finalPaymentMethod);

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      console.log("Cart is empty for user:", req.user._id);
      return res.status(400).json({ error: "Cart is empty" });
    }

    console.log("Creating order with payment method:", finalPaymentMethod);

    // Create new order
    const order = new Order({
      user: req.user._id,
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: cart.totalAmount,
      paymentInfo: {
        paymentMethod: finalPaymentMethod,
        paymentId: paymentId,
        status: PAYMENT_STATUS.PAID,
      },
    });

    await order.save();
    console.log("Order created successfully with ID:", order._id);

    // Clear the cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();
    console.log("Cart cleared successfully");

    // Send success response
    return res.status(200).json({
      success: true,
      orderId: order._id.toString(),
    });
  } catch (err) {
    console.error("Payment processing error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Payment success
module.exports.paymentSuccess = async (req, res) => {
  try {
    const { orderId } = req.query;

    if (!orderId) {
      req.flash("error", "Order ID is missing");
      return res.redirect("/products");
    }

    // Find the order
    const order = await Order.findById(orderId).populate("items.product");

    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/products");
    }

    // Check if the order belongs to the current user
    if (order.user.toString() !== req.user._id.toString()) {
      req.flash("error", "Unauthorized access to order");
      return res.redirect("/products");
    }

    res.render("payment/success", { order });
  } catch (err) {
    req.flash("error", "Failed to load order details");
    res.redirect("/products");
  }
};

// Payment cancel/failure page
module.exports.paymentCancel = (req, res) => {
  req.flash("error", "Payment was cancelled or failed");
  res.redirect("/cart");
};

// View order history
module.exports.orderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "items.product",
        select: "title image",
      });

    res.render("payment/orders", { orders });
  } catch (err) {
    req.flash("error", "Failed to load order history");
    res.redirect("/products");
  }
};

// View single order
module.exports.viewOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");

    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/payment/orders");
    }

    // Check if the order belongs to the current user
    if (order.user.toString() !== req.user._id.toString()) {
      req.flash("error", "Unauthorized access to order");
      return res.redirect("/payment/orders");
    }

    res.render("payment/order-details", { order });
  } catch (err) {
    req.flash("error", "Failed to load order details");
    res.redirect("/payment/orders");
  }
};
