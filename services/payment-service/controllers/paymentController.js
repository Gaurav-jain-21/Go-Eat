const Razorpay = require("razorpay");
require("dotenv").config();

const crypto = require("crypto");

const Payment = require("../models/Payment");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    const payment = await Payment.create({
      userId: req.user.id,
      orderId,
      razorpayOrderId: razorpayOrder.id,
      amount,
      status: "Pending",
    });

    res.status(201).json({
      razorpayOrder,
      payment,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: "Invalid Signature",
      });
    }

    const payment = await Payment.findOneAndUpdate(
      {
        razorpayOrderId: razorpay_order_id,
      },
      {
        razorpayPaymentId: razorpay_payment_id,

        razorpaySignature: razorpay_signature,

        status: "Paid",
      },
      {
        returnDocument: "after",
      },
    );

    res.status(200).json({
      success: true,
      message: "Payment Verified",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const paymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({
      userId: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getSinglePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    if (payment.status !== "Paid") {
      return res.status(400).json({
        message: "Only paid payments can be refunded",
      });
    }

    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: payment.amount * 100,
    });

    payment.status = "Refunded";

    payment.refundStatus = "Refunded";

    payment.refundAmount = payment.amount;

    payment.refundId = refund.id;

    await payment.save();

    res.status(200).json({
      success: true,
      message: "Refund successful",
      refund,
      payment,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const refundHistory = async (req, res) => {
  try {
    const refunds = await Payment.find({
      userId: req.user.id,
      refundStatus: "Refunded",
    });

    res.status(200).json(refunds);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  paymentHistory,
  getSinglePayment,
  refundPayment,
  refundHistory,
};
