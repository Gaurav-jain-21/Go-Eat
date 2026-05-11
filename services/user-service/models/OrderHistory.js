const mongoose = require("mongoose");

const orderHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    orderId: String,

    items: [],

    totalAmount: Number,

    status: {
      type: String,
      default: "Placed",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("OrderHistory", orderHistorySchema);
