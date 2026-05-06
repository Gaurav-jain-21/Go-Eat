const router = require("express").Router();
const upload = require("../middleware/upload");
const { verifyToken, requireRole } = require("../middleware/verifyToken");
const {
  addFood,
  updateFood,
  toggleAvailability,
  deleteFood,
  getFoodsByHotel,
} = require("../controllers/food.controller");

router.get("/hotel/:hotelId", getFoodsByHotel);

router.post(
  "/",
  verifyToken,
  requireRole("hotel"),
  upload.single("image"),
  addFood,
);
router.put(
  "/:id",
  verifyToken,
  requireRole("hotel"),
  upload.single("image"),
  updateFood,
);
router.patch(
  "/:id/toggle",
  verifyToken,
  requireRole("hotel"),
  toggleAvailability,
);
router.delete("/:id", verifyToken, requireRole("hotel"), deleteFood);

module.exports = router;
