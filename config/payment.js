// Custom payment configuration
const generatePaymentId = () => {
  // Generate a unique payment ID with timestamp and random string
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `PAY-${timestamp}-${randomStr}`;
};

// Payment status constants
const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
};

// Payment methods
const PAYMENT_METHODS = {
  CUSTOM: "custom",
  COD: "cod",
};

module.exports = {
  generatePaymentId,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
};
