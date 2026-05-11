const express = require("express");

const {
  createHotel,
  getAllHotels,
  getSingleHotel,
  updateHotel,
  deleteHotel,
  toggleHotelStatus,
} = require("../controllers/hotelController");

const { protect, hotelOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", protect, hotelOnly, createHotel);

router.get("/all", getAllHotels);

router.get("/:id", getSingleHotel);

router.put("/:id", protect, hotelOnly, updateHotel);

router.delete("/:id", protect, hotelOnly, deleteHotel);

router.patch("/status/:id", protect, hotelOnly, toggleHotelStatus);

module.exports = router;
