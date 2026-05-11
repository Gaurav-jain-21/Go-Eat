const Food = require("../models/Food");

const createFood = async (req, res) => {
  try {
    const food = await Food.create({
      ownerId: req.user.id,
      ...req.body,
    });

    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAllFoods = async (req, res) => {
  try {
    const foods = await Food.find();

    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getSingleFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    res.status(200).json(food);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    if (food.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    const updatedFood = await Food.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
    });

    res.status(200).json(updatedFood);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    if (food.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    await food.deleteOne();

    res.status(200).json({
      success: true,
      message: "Food deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getFoodsByHotel = async (req, res) => {
  try {
    const foods = await Food.find({
      hotelId: req.params.hotelId,
    });

    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const searchFood = async (req, res) => {
  try {
    const foods = await Food.find({
      name: {
        $regex: req.params.keyword,
        $options: "i",
      },
    });

    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const filterByCategory = async (req, res) => {
  try {
    const foods = await Food.find({
      category: req.params.category,
    });

    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const vegFoods = async (req, res) => {
  try {
    const foods = await Food.find({
      isVeg: true,
    });

    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const nonVegFoods = async (req, res) => {
  try {
    const foods = await Food.find({
      isVeg: false,
    });

    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const popularFoods = async (req, res) => {
  try {
    const foods = await Food.find().sort({ rating: -1 }).limit(10);

    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    if (food.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    food.isAvailable = !food.isAvailable;

    await food.save();

    res.status(200).json(food);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
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
};
