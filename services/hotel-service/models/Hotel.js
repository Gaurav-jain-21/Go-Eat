const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String },
    phone: { type: String },
    image: { type: String },

    address: {
      street: String,
      city: String,
      state: String,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    isApproved: { type: Boolean, default: false },
    isOpen: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },

    foods: [{ type: mongoose.Schema.Types.ObjectId, ref: "Food" }],
  },
  { timestamps: true },
);

hotelSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Hotel", hotelSchema);
