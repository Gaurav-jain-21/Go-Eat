const express = require("express");

const {
  createFood,
  getAllFoods,
  getSingleFood,
  updateFood,
  deleteFood,
  getFoodsByHotel,
  searchFood,
  filterByCategory,
  vegFoods,
  nonVegFoods,
  popularFoods,
  toggleAvailability,
} = require("../controllers/foodController");

const { protect, hotelOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", protect, hotelOnly, createFood);

router.get("/all", getAllFoods);

router.get("/popular", popularFoods);

router.get("/filter/veg", vegFoods);

router.get("/filter/nonveg", nonVegFoods);

router.get("/category/:category", filterByCategory);

router.get("/search/:keyword", searchFood);

router.get("/hotel/:hotelId", getFoodsByHotel);

router.get("/:id", getSingleFood);

router.put("/:id", protect, hotelOnly, updateFood);

router.delete("/:id", protect, hotelOnly, deleteFood);

router.patch("/availability/:id", protect, hotelOnly, toggleAvailability);

module.exports = router;
