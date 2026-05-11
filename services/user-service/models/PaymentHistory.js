const mongoose = require("mongoose");

const paymentHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    orderId: String,

    paymentId: String,

    amount: Number,

    status: String,

    method: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("PaymentHistory", paymentHistorySchema);
