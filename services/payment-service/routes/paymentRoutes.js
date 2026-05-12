const express = require("express");

const {
  createOrder,
  verifyPayment,
  paymentHistory,
  getSinglePayment,
  refundPayment,
  refundHistory,
} = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create-order", protect, createOrder);

router.post("/verify", protect, verifyPayment);

router.get("/history", protect, paymentHistory);

router.get("/refund-history", protect, refundHistory);

router.get("/:id", protect, getSinglePayment);

router.post("/refund/:paymentId", protect, refundPayment);

module.exports = router;
