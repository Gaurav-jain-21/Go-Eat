const axios = require("axios");
const AdminLog = require("../models/AdminLog");

const AUTH_SERVICE = process.env.AUTH_SERVICE_URL;
const HOTEL_SERVICE = process.env.HOTEL_SERVICE_URL;
const FOOD_SERVICE = process.env.FOOD_SERVICE_URL;
const ORDER_SERVICE = process.env.ORDER_SERVICE_URL;
const PAYMENT_SERVICE = process.env.PAYMENT_SERVICE_URL;

const getAuthHeader = (req) => ({
  headers: {
    Authorization: req.headers.authorization,
  },
});

const createLog = async (
  adminId,
  action,
  targetType,
  targetId,
  details = {},
) => {
  try {
    await AdminLog.create({
      adminId,
      action,
      targetType,
      targetId,
      details,
    });
  } catch (error) {
    console.error("Admin log error:", error.message);
  }
};

// DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
  try {
    const [hotelsRes, foodsRes, ordersRes, paymentsRes] =
      await Promise.allSettled([
        axios.get(`${HOTEL_SERVICE}/api/hotels`),
        axios.get(`${FOOD_SERVICE}/api/foods`),
        axios.get(`${ORDER_SERVICE}/api/orders/all`, getAuthHeader(req)),
        axios.get(
          `${PAYMENT_SERVICE}/api/payments/my-payments`,
          getAuthHeader(req),
        ),
      ]);

    const hotels =
      hotelsRes.status === "fulfilled" ? hotelsRes.value.data.total || 0 : 0;

    const foods =
      foodsRes.status === "fulfilled" ? foodsRes.value.data.total || 0 : 0;

    const orders =
      ordersRes.status === "fulfilled" ? ordersRes.value.data.total || 0 : 0;

    const payments =
      paymentsRes.status === "fulfilled"
        ? paymentsRes.value.data.total || 0
        : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalHotels: hotels,
        totalFoods: foods,
        totalOrders: orders,
        totalPayments: payments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

// GET ALL HOTELS
exports.getAllHotels = async (req, res) => {
  try {
    const response = await axios.get(`${HOTEL_SERVICE}/api/hotels`);

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch hotels",
      error: error.message,
    });
  }
};

// GET ALL FOODS
exports.getAllFoods = async (req, res) => {
  try {
    const response = await axios.get(`${FOOD_SERVICE}/api/foods`);

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch foods",
      error: error.message,
    });
  }
};

// GET ALL ORDERS
exports.getAllOrders = async (req, res) => {
  try {
    const response = await axios.get(
      `${ORDER_SERVICE}/api/orders/all`,
      getAuthHeader(req),
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.response?.data || error.message,
    });
  }
};

// GET PAYMENT BY ORDER
exports.getPaymentByOrder = async (req, res) => {
  try {
    const response = await axios.get(
      `${PAYMENT_SERVICE}/api/payments/order/${req.params.orderId}`,
      getAuthHeader(req),
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment",
      error: error.response?.data || error.message,
    });
  }
};

// DELETE FOOD AS ADMIN
exports.deleteFoodAsAdmin = async (req, res) => {
  try {
    /*
      Your current food-service allows only HOTEL owner to delete.
      So this admin endpoint currently creates admin log only.
      Later we will add admin delete route inside food-service.
    */

    await createLog(
      req.user.userId,
      "ADMIN_REQUESTED_DELETE_FOOD",
      "FOOD",
      req.params.foodId,
    );

    res.status(200).json({
      success: true,
      message:
        "Admin delete food request logged. Add admin delete route in food-service later.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete food",
      error: error.message,
    });
  }
};

// BLOCK USER
exports.blockUser = async (req, res) => {
  try {
    /*
      Your auth-service User model currently does not have isBlocked.
      Add isBlocked later in auth-service if you want real block/login prevention.
    */

    await createLog(req.user.userId, "BLOCK_USER", "USER", req.params.userId);

    res.status(200).json({
      success: true,
      message:
        "User block action logged. Add isBlocked field in auth-service for real blocking.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to block user",
      error: error.message,
    });
  }
};

// UNBLOCK USER
exports.unblockUser = async (req, res) => {
  try {
    await createLog(req.user.userId, "UNBLOCK_USER", "USER", req.params.userId);

    res.status(200).json({
      success: true,
      message:
        "User unblock action logged. Add isBlocked field in auth-service for real unblocking.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to unblock user",
      error: error.message,
    });
  }
};

// APPROVE HOTEL
exports.approveHotel = async (req, res) => {
  try {
    await createLog(
      req.user.userId,
      "APPROVE_HOTEL",
      "HOTEL",
      req.params.hotelId,
    );

    res.status(200).json({
      success: true,
      message:
        "Hotel approval action logged. Add approval field in hotel-service later.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to approve hotel",
      error: error.message,
    });
  }
};

// REJECT HOTEL
exports.rejectHotel = async (req, res) => {
  try {
    await createLog(
      req.user.userId,
      "REJECT_HOTEL",
      "HOTEL",
      req.params.hotelId,
    );

    res.status(200).json({
      success: true,
      message:
        "Hotel rejection action logged. Add approval field in hotel-service later.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reject hotel",
      error: error.message,
    });
  }
};

// GET ADMIN LOGS
exports.getAdminLogs = async (req, res) => {
  try {
    const logs = await AdminLog.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin logs",
      error: error.message,
    });
  }
};
