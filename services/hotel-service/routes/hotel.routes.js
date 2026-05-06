const router = require("express").Router();
const upload = require("../middleware/upload");
const { verifyToken, requireRole } = require("../middleware/verifyToken");
const {
  registerHotel,
  getMyHotel,
  updateHotel,
  getAllHotels,
  getHotelById,
  approveHotel,
} = require("../controllers/hotel.controller");

router.get("/", getAllHotels);
router.get("/:id", getHotelById);

router.post(
  "/",
  verifyToken,
  requireRole("hotel"),
  upload.single("image"),
  registerHotel,
);
router.get("/me/profile", verifyToken, requireRole("hotel"), getMyHotel);
router.put(
  "/me/update",
  verifyToken,
  requireRole("hotel"),
  upload.single("image"),
  updateHotel,
);

router.put("/:id/approve", verifyToken, requireRole("admin"), approveHotel);

module.exports = router;
