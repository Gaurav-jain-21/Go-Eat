const UserProfile = require("../models/UserProfile");

const Wishlist = require("../models/Wishlist");

const OrderHistory = require("../models/OrderHistory");

const PaymentHistory = require("../models/PaymentHistory");

const getProfile = async (req, res) => {
  try {
    let profile = await UserProfile.findOne({
      userId: req.user.id,
    });

    if (!profile) {
      profile = await UserProfile.create({
        userId: req.user.id,
      });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      {
        new: true,
        upsert: true,
      },
    );

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const addAddress = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({
      userId: req.user.id,
    });

    profile.addresses.push(req.body);

    await profile.save();

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({
      userId: req.user.id,
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId: req.user.id,
        foods: [],
      });
    }

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const addToWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({
      userId: req.user.id,
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId: req.user.id,
        foods: [],
      });
    }

    wishlist.foods.push(req.body);

    await wishlist.save();

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const removeWishlistItem = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({
      userId: req.user.id,
    });

    wishlist.foods = wishlist.foods.filter(
      (item) => item.foodId !== req.params.foodId,
    );

    await wishlist.save();

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const orders = await OrderHistory.find({
      userId: req.user.id,
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const addOrderHistory = async (req, res) => {
  try {
    const order = await OrderHistory.create({
      userId: req.user.id,
      ...req.body,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const payments = await PaymentHistory.find({
      userId: req.user.id,
    });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const addPaymentHistory = async (req, res) => {
  try {
    const payment = await PaymentHistory.create({
      userId: req.user.id,
      ...req.body,
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  addAddress,
  getWishlist,
  addToWishlist,
  removeWishlistItem,
  getOrderHistory,
  addOrderHistory,
  getPaymentHistory,
  addPaymentHistory,
};
