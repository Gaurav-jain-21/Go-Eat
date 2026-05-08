const crypto  = require('crypto');
const Payment = require('../models/Payment');

// ─────────────────────────────────────────────
// POST /api/payments/webhook/razorpay
// Razorpay automatically calls this URL
// whenever a payment event happens
// ─────────────────────────────────────────────
exports.razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret     = process.env.RAZORPAY_WEBHOOK_SECRET;
    const receivedSignature = req.headers['x-razorpay-signature'];

    if (!receivedSignature) {
      return res.status(400).json({ message: 'No signature found' });
    }

    // verify webhook signature
    // req.body is raw buffer here because of express.raw()
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body)
      .digest('hex');

    if (receivedSignature !== expectedSignature) {
      return res.status(400).json({ message: 'Webhook signature invalid' });
    }

    // parse body after verification
    const event = JSON.parse(req.body.toString());

    console.log('Razorpay webhook event:', event.event);

    // ── Handle different event types ──

    // payment successfully captured
    if (event.event === 'payment.captured') {
      const razorpayPaymentId = event.payload.payment.entity.id;
      const razorpayOrderId   = event.payload.payment.entity.order_id;

      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { razorpayPaymentId, status: 'paid' }
      );

      console.log(`Payment ${razorpayPaymentId} captured`);
    }

    // payment failed
    if (event.event === 'payment.failed') {
      const razorpayOrderId = event.payload.payment.entity.order_id;

      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: 'failed' }
      );

      console.log(`Payment failed for order ${razorpayOrderId}`);
    }

    // refund processed successfully
    if (event.event === 'refund.processed') {
      const refundId = event.payload.refund.entity.id;

      await Payment.findOneAndUpdate(
        { refundId },
        { refundStatus: 'completed' }
      );

      console.log(`Refund ${refundId} completed`);
      // TODO: when we build notification service,
      // notify user here that refund is complete
    }

    // refund failed
    if (event.event === 'refund.failed') {
      const refundId = event.payload.refund.entity.id;

      await Payment.findOneAndUpdate(
        { refundId },
        { refundStatus: 'failed' }
      );

      console.log(`Refund ${refundId} failed — admin needs to handle manually`);
    }

    // always respond 200 to Razorpay
    // if you don't respond quickly, Razorpay retries the webhook
    res.status(200).json({ received: true });

  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).json({ message: err.message });
  }
};