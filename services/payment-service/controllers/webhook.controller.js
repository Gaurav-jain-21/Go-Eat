const crypto  = require("crypto");
const axios   = require("axios");
const Payment = require("../models/Payment");

// ─────────────────────────────────────────────
// POST /api/payments/webhook/razorpay
// Razorpay automatically calls this URL
// whenever a payment event happens on their end
//
// IMPORTANT: express.raw() must be used for
// this route — not express.json() — because
// signature verification needs the raw buffer
// ─────────────────────────────────────────────
exports.razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret      = process.env.RAZORPAY_WEBHOOK_SECRET;
    const receivedSignature  = req.headers["x-razorpay-signature"];

    // reject if no signature header present
    if (!receivedSignature) {
      return res.status(400).json({ message: "No signature found in headers" });
    }

    // ── SIGNATURE VERIFICATION ──
    // Razorpay signs the raw request body with your webhook secret
    // We recreate the same HMAC SHA256 and compare
    // If they match → request is genuinely from Razorpay
    // If they don't → reject immediately (possible attack)
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body) // raw Buffer — must come before JSON.parse
      .digest("hex");

    if (receivedSignature !== expectedSignature) {
      console.warn("Razorpay webhook: invalid signature detected");
      return res.status(400).json({ message: "Webhook signature invalid" });
    }

    // parse body AFTER signature verification
    const event = JSON.parse(req.body.toString());

    console.log("Razorpay webhook event received:", event.event);

    // ─────────────────────────────────────────
    // EVENT: payment.captured
    // Fires when user successfully pays
    // ─────────────────────────────────────────
    if (event.event === "payment.captured") {
      const razorpayPaymentId = event.payload.payment.entity.id;
      const razorpayOrderId   = event.payload.payment.entity.order_id;

      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { razorpayPaymentId, status: "paid" }
      );

      console.log(`Payment captured: ${razorpayPaymentId}`);
    }

    // ─────────────────────────────────────────
    // EVENT: payment.failed
    // Fires when payment attempt fails
    // ─────────────────────────────────────────
    if (event.event === "payment.failed") {
      const razorpayOrderId = event.payload.payment.entity.order_id;

      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: "failed" }
      );

      console.log(`Payment failed for Razorpay order: ${razorpayOrderId}`);
    }

    // ─────────────────────────────────────────
    // EVENT: refund.processed
    // Fires when Razorpay successfully processes a refund
    // ─────────────────────────────────────────
    if (event.event === "refund.processed") {
      const refundId = event.payload.refund.entity.id;

      const payment = await Payment.findOneAndUpdate(
        { refundId },
        { refundStatus: "completed" },
        { new: true } // return updated document
      );

      console.log(`Refund completed: ${refundId}`);

      // notify user that their refund is done
      // only if we found the payment record
      if (payment) {
        axios
          .post(
            `${process.env.NOTIFICATION_SERVICE_URL}/api/notifications/refund-completed`,
            {
              userId:       payment.user,
              orderId:      payment.order,
              refundAmount: payment.refundAmount,
            }
          )
          .catch((err) =>
            console.error("Refund completed notification failed:", err.message)
          );
      }
    }

    // ─────────────────────────────────────────
    // EVENT: refund.failed
    // Fires when Razorpay could not process refund
    // Admin needs to handle this manually
    // ─────────────────────────────────────────
    if (event.event === "refund.failed") {
      const refundId = event.payload.refund.entity.id;

      await Payment.findOneAndUpdate(
        { refundId },
        { refundStatus: "failed" }
      );

      // log clearly so admin can see it in server logs
      console.error(
        `⚠️  REFUND FAILED: ${refundId} — requires manual admin action`
      );
    }

    // ─────────────────────────────────────────
    // Always respond 200 immediately
    // If you don't, Razorpay will keep retrying
    // the webhook multiple times thinking it failed
    // ─────────────────────────────────────────
    res.status(200).json({ received: true });

  } catch (err) {
    console.error("Webhook processing error:", err.message);
    // still return 200 so Razorpay doesn't retry
    // log the error for debugging
    res.status(200).json({ received: true, error: err.message });
  }
};
