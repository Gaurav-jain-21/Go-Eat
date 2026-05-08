const Razorpay = require('razorpay');
const crypto   = require('crypto');
const Payment  = require('../models/Payment');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// STEP 1: Create Razorpay order — frontend calls this first
// POST /api/payments/razorpay/create-order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, orderId, userId } = req.body;

    // Razorpay amount is in paise (1 INR = 100 paise)
    const options = {
      amount:   Math.round(amount * 100),
      currency: 'INR',
      receipt:  `receipt_${orderId}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // save payment record with status 'created'
    await Payment.create({
      user:            userId,
      order:           orderId,
      amount,
      currency:        'INR',
      method:          'razorpay',
      razorpayOrderId: razorpayOrder.id,
      status:          'created',
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount:          razorpayOrder.amount,
      currency:        razorpayOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// STEP 2: Verify payment after user pays on frontend
// POST /api/payments/razorpay/verify
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    // verify signature — this proves the payment is genuine
    const body      = razorpayOrderId + '|' + razorpayPaymentId;
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpaySignature) {
      return res.status(400).json({ message: 'Invalid payment signature — possible fraud!' });
    }

    // signature valid — update payment record
    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'paid',
      }
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