const express = require("express");

const {
  getProfile,
  updateProfile,
  addAddress,
  getWishlist,
  addToWishlist,
  removeWishlistItem,
  getOrderHistory,
  addOrderHistory,
  getPaymentHistory,
  addPaymentHistory,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", protect, getProfile);

router.put("/profile", protect, updateProfile);

router.post("/address", protect, addAddress);

router.get("/wishlist", protect, getWishlist);

router.post("/wishlist", protect, addToWishlist);

router.delete("/wishlist/:foodId", protect, removeWishlistItem);

router.get("/orders", protect, getOrderHistory);

router.post("/orders", protect, addOrderHistory);

router.get("/payments", protect, getPaymentHistory);

router.post("/payments", protect, addPaymentHistory);

module.exports = router;
