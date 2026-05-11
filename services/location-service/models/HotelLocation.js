const mongoose = require("mongoose");

const hotelLocationSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    coordinates: {
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

    address: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

hotelLocationSchema.index({
  coordinates: "2dsphere",
});

module.exports = mongoose.model("HotelLocation", hotelLocationSchema);
