const Food = require("../models/Food");
const Hotel = require("../models/Hotel");

exports.addFood = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.user.id });
    if (!hotel)
      return res.status(404).json({ message: "Register your hotel first" });
    if (!hotel.isApproved)
      return res.status(403).json({ message: "Hotel not approved yet" });

    const { name, description, price, category, isVeg } = req.body;

    const food = await Food.create({
      hotel: hotel._id,
      name,
      description,
      price: parseFloat(price),
      category,
      isVeg: isVeg === "true",
      image: req.file ? req.file.path : null,
    });

    hotel.foods.push(food._id);
    await hotel.save();

    res.status(201).json({ message: "Food item added", food });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: "Food not found" });

    const hotel = await Hotel.findOne({ owner: req.user.id });
    if (!hotel || food.hotel.toString() !== hotel._id.toString())
      return res.status(403).json({ message: "Not your food item" });

    const { name, description, price, category, isVeg, isAvailable } = req.body;
    if (name) food.name = name;
    if (description) food.description = description;
    if (price) food.price = parseFloat(price);
    if (category) food.category = category;
    if (isVeg !== undefined) food.isVeg = isVeg === "true";
    if (isAvailable !== undefined) food.isAvailable = isAvailable === "true";
    if (req.file) food.image = req.file.path;

    await food.save();
    res.json({ message: "Food updated", food });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    const hotel = await Hotel.findOne({ owner: req.user.id });
    if (!hotel || food.hotel.toString() !== hotel._id.toString())
      return res.status(403).json({ message: "Not your food item" });

    food.isAvailable = !food.isAvailable;
    await food.save();
    res.json({
      message: `Item marked ${food.isAvailable ? "available" : "unavailable"}`,
      food,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    const hotel = await Hotel.findOne({ owner: req.user.id });
    if (!hotel || food.hotel.toString() !== hotel._id.toString())
      return res.status(403).json({ message: "Not your food item" });

    await food.deleteOne();
    hotel.foods = hotel.foods.filter((f) => f.toString() !== req.params.id);
    await hotel.save();

    res.json({ message: "Food item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFoodsByHotel = async (req, res) => {
  try {
    const foods = await Food.find({
      hotel: req.params.hotelId,
      isAvailable: true,
    });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
