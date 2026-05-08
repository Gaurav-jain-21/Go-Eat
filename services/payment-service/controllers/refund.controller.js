const Razorpay = require('razorpay');
const { client, paypal } = require('../utils/paypalClient');
const Payment = require('../models/Payment');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.processRefund = async (req, res) => {
  try {
    const { paymentId, amount, paymentMethod } = req.body;

    const payment = await Payment.findOne({
      $or: [
        { razorpayPaymentId: paymentId },
        { paypalCaptureId:   paymentId },
      ],
    });

    if (!payment) return res.status(404).json({ message: 'Payment record not found' });
    if (payment.status !== 'paid')
      return res.status(400).json({ message: 'Payment not eligible for refund' });

    let refundId;

    if (paymentMethod === 'razorpay') {
      const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: Math.round(amount * 100),  // paise
        speed:  'normal',                  // 'normal' = 5-7 days, 'optimum' = instant
        notes:  { reason: 'Order cancelled by user' },
      });
      refundId = refund.id;

    } else if (paymentMethod === 'paypal') {
      const request = new paypal.payments.CapturesRefundRequest(payment.paypalCaptureId);
      request.requestBody({
        amount: {
          currency_code: 'USD',
          value:          amount.toFixed(2),
        },
      });
      const refund = await client().execute(request);
      refundId = refund.result.id;
    }

    payment.status       = 'refunded';
    payment.refundId     = refundId;
    payment.refundAmount = amount;
    payment.refundStatus = 'initiated';
    payment.refundedAt   = new Date();
    await payment.save();

    res.json({
      success:  true,
      refundId,
      message:  'Refund initiated successfully',
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};