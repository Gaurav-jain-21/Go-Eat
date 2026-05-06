const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  food: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
  name: String,
  price: Number,
  image: String,
  quantity: Number,
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [orderItemSchema],

    hotels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
      },
    ],

    totalAmount: { type: Number, required: true },

    paymentMethod: {
      type: String,
      enum: ["razorpay", "paypal"],
      required: true,
    },
    paymentId: { type: String },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },

    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },

    status: {
      type: String,
      enum: [
        "Placed",
        "Confirmed",
        "Preparing",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Placed",
    },

    confirmedAt: Date,
    preparingAt: Date,
    dispatchedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,

    refundId: String,
    refundStatus: {
      type: String,
      enum: ["none", "initiated", "completed"],
      default: "none",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
