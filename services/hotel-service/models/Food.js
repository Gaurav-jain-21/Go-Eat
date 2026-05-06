const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
    category: {
      type: String,
      enum: ["Starter", "Main Course", "Dessert", "Beverage", "Snack"],
    },
    isAvailable: { type: Boolean, default: true },
    isVeg: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Food", foodSchema);
