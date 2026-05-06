const router = require("express").Router();
const { verifyToken } = require("../middleware/verifyToken");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");

router.get("/", verifyToken, getCart);
router.post("/add", verifyToken, addToCart);
router.put("/update/:foodId", verifyToken, updateCartItem);
router.delete("/remove/:foodId", verifyToken, removeFromCart);
router.delete("/clear", verifyToken, clearCart);

module.exports = router;
