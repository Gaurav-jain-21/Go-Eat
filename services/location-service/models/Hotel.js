const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    image: String,
    address: Object,
    isApproved: Boolean,
    isOpen: Boolean,
    rating: Number,
    foods: [{ type: mongoose.Schema.Types.ObjectId, ref: "Food" }],

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: [Number],
    },
  },
  { timestamps: true },
);

hotelSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Hotel", hotelSchema);
