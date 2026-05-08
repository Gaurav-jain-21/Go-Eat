const { client, paypal } = require('../utils/paypalClient');
const Payment = require('../models/Payment');

// STEP 1: Create PayPal order
// POST /api/payments/paypal/create-order
exports.createPaypalOrder = async (req, res) => {
  try {
    const { amount, orderId, userId } = req.body;

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value:          amount.toFixed(2),
        },
        reference_id: orderId,
      }],
    });

    const paypalOrder = await client().execute(request);

    // save payment record
    await Payment.create({
      user:         userId,
      order:        orderId,
      amount,
      currency:     'USD',
      method:       'paypal',
      paypalOrderId: paypalOrder.result.id,
      status:       'created',
    });

    res.json({
      paypalOrderId: paypalOrder.result.id,
      status:        paypalOrder.result.status,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// STEP 2: Capture PayPal payment after user approves
// POST /api/payments/paypal/capture
exports.capturePaypalPayment = async (req, res) => {
  try {
    const { paypalOrderId } = req.body;

    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({});

    const capture = await client().execute(request);
    const captureId = capture.result.purchase_units[0]
      .payments.captures[0].id;

    // update payment record
    await Payment.findOneAndUpdate(
      { paypalOrderId },
      { paypalCaptureId: captureId, status: 'paid' }
    );

    res.json({
      success:   true,
      message:   'PayPal payment captured',
      captureId,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};