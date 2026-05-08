const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
    required: true,
  },

  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'Order',
    required: true,
  },

  amount:   { type: Number, required: true },
  currency: { type: String, default: 'INR' },

  method: {
    type: String,
    enum: ['razorpay', 'paypal'],
    required: true,
  },

  // ── Razorpay fields ──
  razorpayOrderId:   { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },

  // ── PayPal fields ──
  paypalOrderId:  { type: String },
  paypalCaptureId:{ type: String },

  // ── Status ──
  status: {
    type: String,
    enum: ['created', 'paid', 'failed', 'refunded'],
    default: 'created',
  },

  // ── Refund ──
  refundId:     { type: String },
  refundAmount: { type: Number },
  refundStatus: {
    type: String,
    enum: ['none', 'initiated', 'completed', 'failed'],
    default: 'none',
  },
  refundedAt: { type: Date },

}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);