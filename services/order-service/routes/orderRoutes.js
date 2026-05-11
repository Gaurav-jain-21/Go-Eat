const express = require("express");

const {
  addToCart,
  getCart,
  removeCartItem,
  createOrder,
  getUserOrders,
  getSingleOrder,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");

const { protect, hotelOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/cart/add", protect, addToCart);

router.get("/cart", protect, getCart);

router.delete("/cart/:foodId", protect, removeCartItem);

router.post("/create", protect, createOrder);

router.get("/user", protect, getUserOrders);

router.get("/:id", protect, getSingleOrder);

router.patch("/status/:id", protect, hotelOnly, updateOrderStatus);

router.patch("/cancel/:id", protect, cancelOrder);

module.exports = router;
