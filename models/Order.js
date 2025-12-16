const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      qty: Number,
      price: Number
    }
  ],
  totalAmount: Number,
  paymentId: String, // Stripe Session ID
  status: { type: String, default: 'Paid' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);