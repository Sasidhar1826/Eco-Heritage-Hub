# Exsel Project

A Node.js e-commerce application with custom payment processing.

## Payment System

The payment system has been designed to provide a streamlined checkout experience:

1. **Checkout Process**: Users can view their cart and proceed to checkout
2. **Payment Methods**: Choose between custom payment or cash on delivery
3. **Order Management**: View order history and details

### Payment Options

The application supports two payment methods:

1. **Custom Payment**: Enter card details for a simulated payment experience
2. **Cash on Delivery (COD)**: Pay when you receive your order

### Testing Custom Payments

For testing the custom payment option, you can enter any valid-looking information:

- Card Number: Any 16-digit number
- Expiry Date: Any future date
- CVV: Any 3 digits

## Setup

1. Install dependencies: `npm install`
2. Set up environment variables in `.env` file
3. Start the server: `npm start`
