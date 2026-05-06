const router = require("express").Router();
const { verifyToken, requireRole } = require("../middleware/verifyToken");
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getHotelOrders,
  getAllOrders,
} = require("../controllers/order.controller");

router.post("/place", verifyToken, requireRole("user"), placeOrder);
router.get("/my-orders", verifyToken, requireRole("user"), getMyOrders);
router.get("/:id", verifyToken, getOrderById);
router.delete("/:id/cancel", verifyToken, requireRole("user"), cancelOrder);

router.get(
  "/hotel/incoming",
  verifyToken,
  requireRole("hotel"),
  getHotelOrders,
);
router.put("/:id/status", verifyToken, requireRole("hotel"), updateOrderStatus);

router.get("/admin/all", verifyToken, requireRole("admin"), getAllOrders);

module.exports = router;
