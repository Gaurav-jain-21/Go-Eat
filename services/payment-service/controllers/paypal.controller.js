const { client, paypal } = require('../utils/paypalClient');
const Payment = require('../models/Payment');

// ─────────────────────────────────────────────
// STEP 1 of PayPal flow
// POST /api/payments/paypal/create-order
// ─────────────────────────────────────────────
exports.createPaypalOrder = async (req, res) => {
  try {
    const { amount, orderId, userId } = req.body;

    if (!amount || !orderId || !userId) {
      return res.status(400).json({ message: 'amount, orderId and userId are required' });
    }

    // build PayPal order request
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',   // means we want to capture money immediately
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value:          amount.toFixed(2),  // e.g. "6.50"
        },
        reference_id: orderId.toString(),
      }],
      application_context: {
        brand_name:          'FoodApp',
        landing_page:        'NO_PREFERENCE',
        user_action:         'PAY_NOW',
        return_url:          `${process.env.CLIENT_URL}/payment/success`,
        cancel_url:          `${process.env.CLIENT_URL}/payment/cancel`,
      },
    });

    const paypalOrder = await client().execute(request);

    // save payment record
    await Payment.create({
      user:          userId,
      order:         orderId,
      amount,
      currency:      'USD',
      method:        'paypal',
      paypalOrderId: paypalOrder.result.id,
      status:        'created',
    });

    res.status(201).json({
      paypalOrderId: paypalOrder.result.id,
      status:        paypalOrder.result.status,
      // frontend PayPal button uses this ID
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// STEP 2 of PayPal flow — capture money
// Called after user approves payment
// POST /api/payments/paypal/capture
// ─────────────────────────────────────────────
exports.capturePaypalPayment = async (req, res) => {
  try {
    const { paypalOrderId } = req.body;

    if (!paypalOrderId) {
      return res.status(400).json({ message: 'paypalOrderId is required' });
    }

    // capture = actually take the money from buyer
    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({});

    const capture = await client().execute(request);

    // get the capture ID from response
    const captureId = capture.result
      .purchase_units[0]
      .payments
      .captures[0]
      .id;

    const captureStatus = capture.result
      .purchase_units[0]
      .payments
      .captures[0]
      .status;

    if (captureStatus !== 'COMPLETED') {
      return res.status(400).json({ message: `Payment not completed. Status: ${captureStatus}` });
    }

    // update payment record
    await Payment.findOneAndUpdate(
      { paypalOrderId },
      {
        paypalCaptureId: captureId,
        status:          'paid',
      },
      { new: true }
    );

    res.json({
      success:   true,
      message:   'PayPal payment captured successfully',
      captureId,
      paymentId: captureId,  // use this as paymentId in order service
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};