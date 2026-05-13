const express = require("express");

const {
  createHotel,
  getAllHotels,
  getHotelById,
  getNearbyHotels,
  updateHotel,
  deleteHotel,
} = require("../controllers/hotelController");

const { protect, hotelOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Hotel routes working",
  });
});

router.post("/", protect, hotelOnly, createHotel);

router.get("/", getAllHotels);

router.get("/nearby", getNearbyHotels);

router.get("/:id", getHotelById);

router.put("/:id", protect, hotelOnly, updateHotel);

router.delete("/:id", protect, hotelOnly, deleteHotel);

module.exports = router;
