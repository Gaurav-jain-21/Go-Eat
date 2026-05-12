const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    razorpayOrderId: {
      type: String,
      required: true,
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    razorpaySignature: {
      type: String,
      default: "",
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    paymentMethod: {
      type: String,
      default: "UPI",
    },

    status: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },

    refundStatus: {
      type: String,
      enum: [
        "Not Requested",
        "Requested",
        "Processing",
        "Refunded",
        "Rejected",
      ],
      default: "Not Requested",
    },

    refundAmount: {
      type: Number,
      default: 0,
    },

    refundId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Payment", paymentSchema);
