const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  label: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
});

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    phone: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    addresses: [addressSchema],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("UserProfile", userProfileSchema);
