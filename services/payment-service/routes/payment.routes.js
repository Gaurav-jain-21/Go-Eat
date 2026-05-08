const router = require('express').Router();
const { verifyToken } = require('../middleware/verifyToken');
const { createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/razorpay.controller');
const { createPaypalOrder, capturePaypalPayment }     = require('../controllers/paypal.controller');
const { processRefund }                               = require('../controllers/refund.controller');
const { razorpayWebhook }                             = require('../controllers/webhook.controller');


router.post('/razorpay/create-order', verifyToken, createRazorpayOrder);
router.post('/razorpay/verify',       verifyToken, verifyRazorpayPayment);


router.post('/paypal/create-order',   verifyToken, createPaypalOrder);
router.post('/paypal/capture',        verifyToken, capturePaypalPayment);

router.post('/refund', processRefund);

router.post('/webhook/razorpay', razorpayWebhook);

module.exports = router;