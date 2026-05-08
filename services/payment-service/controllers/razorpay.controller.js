const Razorpay = require('razorpay');
const crypto   = require('crypto');   // built-in Node.js — no install needed
const Payment  = require('../models/Payment');

// create Razorpay instance using your keys
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─────────────────────────────────────────────
// STEP 1 of payment flow
// Frontend calls this FIRST to create an order
// POST /api/payments/razorpay/create-order
// ─────────────────────────────────────────────
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, orderId, userId } = req.body;

    if (!amount || !orderId || !userId) {
      return res.status(400).json({ message: 'amount, orderId and userId are required' });
    }

    // Razorpay works in PAISE — multiply by 100
    // ₹485 → 48500 paise
    const options = {
      amount:   Math.round(amount * 100),
      currency: 'INR',
      receipt:  `receipt_${orderId}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // save payment record — status is 'created' (not paid yet)
    await Payment.create({
      user:            userId,
      order:           orderId,
      amount,
      currency:        'INR',
      method:          'razorpay',
      razorpayOrderId: razorpayOrder.id,
      status:          'created',
    });

    // send back to frontend so it can open the Razorpay popup
    res.status(201).json({
      razorpayOrderId: razorpayOrder.id,
      amount:          razorpayOrder.amount,
      currency:        razorpayOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID, // frontend needs this
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// STEP 2 of payment flow
// Called AFTER user pays in the Razorpay popup
// POST /api/payments/razorpay/verify
// ─────────────────────────────────────────────
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: 'Missing payment details' });
    }

    // ── SIGNATURE VERIFICATION ──
    // Razorpay sends: orderId + "|" + paymentId, signed with your secret
    // We recreate the same signature and compare
    // If they match → payment is genuine
    // If they don't → someone tampered with the data
    const body = razorpayOrderId + '|' + razorpayPaymentId;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature — possible fraud detected!',
      });
    }

    // signature valid — update payment record to 'paid'
    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'paid',
      },
      { new: true }
    );

    res.json({
      success:   true,
      message:   'Payment verified successfully',
      paymentId: razorpayPaymentId,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/payments/razorpay/:orderId
// Get payment details for a specific order
exports.getRazorpayPayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      order:  req.params.orderId,
      method: 'razorpay',
    });

    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};