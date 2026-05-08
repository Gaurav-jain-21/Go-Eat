const crypto  = require('crypto');
const Payment = require('../models/Payment');

exports.razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret    = process.env.RAZORPAY_WEBHOOK_SECRET;
    const receivedSignature = req.headers['x-razorpay-signature'];

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body)   
      .digest('hex');

    if (receivedSignature !== expectedSignature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = JSON.parse(req.body);

    if (event.event === 'payment.captured') {
      const paymentId = event.payload.payment.entity.id;
      await Payment.findOneAndUpdate(
        { razorpayPaymentId: paymentId },
        { status: 'paid' }
      );
    }

    if (event.event === 'refund.processed') {
      const refundId = event.payload.refund.entity.id;
      await Payment.findOneAndUpdate(
        { refundId },
        { refundStatus: 'completed' }
      );
    }

    if (event.event === 'payment.failed') {
      const paymentId = event.payload.payment.entity.id;
      await Payment.findOneAndUpdate(
        { razorpayPaymentId: paymentId },
        { status: 'failed' }
      );
    }

    res.json({ received: true });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};