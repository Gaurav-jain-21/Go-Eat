const express = require("express");

const {
  saveHotelLocation,
  saveUserLocation,
  nearbyHotels,
  calculateDistance,
  deliveryCheck,
} = require("../controllers/locationController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/hotel", saveHotelLocation);

router.post("/user", protect, saveUserLocation);

router.get("/nearby", nearbyHotels);

router.get("/distance", calculateDistance);

router.get("/delivery-check", deliveryCheck);

module.exports = router;
