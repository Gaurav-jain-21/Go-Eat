const router = require("express").Router();
const {
  getNearbyHotels,
  getDistanceToHotel,
} = require("../controllers/location.controller");
router.get("/nearby", getNearbyHotels);
router.get("/distance", getDistanceToHotel);

module.exports = router;
