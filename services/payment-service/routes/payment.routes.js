const router = require('express').Router();
const { verifyToken }                                  = require('../middleware/verifyToken');
const { createRazorpayOrder, verifyRazorpayPayment,
        getRazorpayPayment }                           = require('../controllers/razorpay.controller');
const { createPaypalOrder, capturePaypalPayment }      = require('../controllers/paypal.controller');
const { processRefund, getRefundStatus }               = require('../controllers/refund.controller');
const { razorpayWebhook }                              = require('../controllers/webhook.controller');

// ── Razorpay ──
router.post('/razorpay/create-order', verifyToken, createRazorpayOrder);
router.post('/razorpay/verify',       verifyToken, verifyRazorpayPayment);
router.get('/razorpay/:orderId',      verifyToken, getRazorpayPayment);

// ── PayPal ──
router.post('/paypal/create-order',   verifyToken, createPaypalOrder);
router.post('/paypal/capture',        verifyToken, capturePaypalPayment);

// ── Refund ──
// No JWT here — called internally by Order Service
router.post('/refund',                processRefund);
router.get('/refund/:paymentId',      verifyToken, getRefundStatus);

// ── Webhook ──
// No JWT — called by Razorpay servers directly
router.post('/webhook/razorpay',      razorpayWebhook);

module.exports = router;