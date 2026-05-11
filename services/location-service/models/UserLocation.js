const mongoose = require("mongoose");

const userLocationSchema = new mongoose.Schema(
  {
    userId: {
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
  },
  {
    timestamps: true,
  },
);

userLocationSchema.index({
  coordinates: "2dsphere",
});

module.exports = mongoose.model("UserLocation", userLocationSchema);
