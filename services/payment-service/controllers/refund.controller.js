const Razorpay           = require('razorpay');
const { client, paypal } = require('../utils/paypalClient');
const Payment            = require('../models/Payment');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─────────────────────────────────────────────
// POST /api/payments/refund
// Called by Order Service when user cancels
// ─────────────────────────────────────────────
exports.processRefund = async (req, res) => {
  try {
    const { paymentId, amount, paymentMethod } = req.body;

    if (!paymentId || !amount || !paymentMethod) {
      return res.status(400).json({ message: 'paymentId, amount and paymentMethod are required' });
    }

    // find the payment record using either Razorpay or PayPal ID
    const payment = await Payment.findOne({
      $or: [
        { razorpayPaymentId: paymentId },
        { paypalCaptureId:   paymentId },
      ],
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (payment.status !== 'paid') {
      return res.status(400).json({ message: 'Only paid payments can be refunded' });
    }

    if (payment.refundStatus === 'initiated' || payment.refundStatus === 'completed') {
      return res.status(400).json({ message: 'Refund already processed for this payment' });
    }

    let refundId;

    // ── RAZORPAY REFUND ──
    if (paymentMethod === 'razorpay') {
      const refund = await razorpay.payments.refund(
        payment.razorpayPaymentId,
        {
          amount: Math.round(amount * 100), // back to paise
          speed:  'normal',                 // 5-7 working days
          notes:  {
            reason:   'Order cancelled by user',
            orderId:  payment.order.toString(),
          },
        }
      );
      refundId = refund.id;
    }

    // ── PAYPAL REFUND ──
    else if (paymentMethod === 'paypal') {
      const request = new paypal.payments.CapturesRefundRequest(
        payment.paypalCaptureId
      );
      request.requestBody({
        amount: {
          currency_code: 'USD',
          value:          amount.toFixed(2),
        },
        note_to_payer: 'Your order was cancelled. Refund processed.',
      });

      const refund = await client().execute(request);
      refundId = refund.result.id;
    }

    else {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    // update payment record
    payment.status       = 'refunded';
    payment.refundId     = refundId;
    payment.refundAmount = amount;
    payment.refundStatus = 'initiated';
    payment.refundedAt   = new Date();
    await payment.save();

    res.json({
      success:  true,
      refundId,
      message:  'Refund initiated. Amount will be credited in 5-7 working days.',
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/payments/refund/:paymentId
// Check refund status
exports.getRefundStatus = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      $or: [
        { razorpayPaymentId: req.params.paymentId },
        { paypalCaptureId:   req.params.paymentId },
      ],
    });

    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    res.json({
      refundStatus: payment.refundStatus,
      refundId:     payment.refundId,
      refundAmount: payment.refundAmount,
      refundedAt:   payment.refundedAt,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};