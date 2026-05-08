const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order:         { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount:        { type: Number, required: true },
  currency:      { type: String, default: 'INR' },
  method:        { type: String, enum: ['razorpay', 'paypal'], required: true },
  razorpayOrderId:   String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  paypalOrderId:     String,
  paypalCaptureId:   String,

  status: {
    type: String,
    enum: ['created', 'paid', 'failed', 'refunded'],
    default: 'created',
  },

  refundId:     String,
  refundAmount: Number,
  refundStatus: {
    type: String,
    enum: ['none', 'initiated', 'completed', 'failed'],
    default: 'none',
  },
  refundedAt: Date,

}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);