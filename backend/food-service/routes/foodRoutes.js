const express = require("express");

const {
  addFood,
  getAllFoods,
  getFoodById,
  getFoodsByHotel,
  getMyFoods,
  updateFood,
  deleteFood,
  toggleAvailability,
} = require("../controllers/foodController");

const { protect, hotelOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Food routes working",
  });
});

router.post("/", protect, hotelOnly, addFood);

router.get("/", getAllFoods);

router.get("/my-foods", protect, hotelOnly, getMyFoods);

router.get("/hotel/:hotelId", getFoodsByHotel);

router.get("/:id", getFoodById);

router.put("/:id", protect, hotelOnly, updateFood);

router.patch("/:id/availability", protect, hotelOnly, toggleAvailability);

router.delete("/:id", protect, hotelOnly, deleteFood);

module.exports = router;
