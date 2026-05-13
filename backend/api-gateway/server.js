const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "GoEat API Gateway is running",
    services: {
      auth: "/api/auth",
      users: "/api/users",
      hotels: "/api/hotels",
      foods: "/api/foods",
      cart: "/api/cart",
      orders: "/api/orders",
      payments: "/api/payments",
      ai: "/api/ai",
      notifications: "/api/notifications",
      admin: "/api/admin",
      reviews: "/api/reviews",
      delivery: "/api/delivery",
      recommendations: "/api/recommendations",
    },
  });
});

const proxyOptions = (target) => ({
  target,
  changeOrigin: true,
  logLevel: "debug",
  onError: (err, req, res) => {
    res.status(500).json({
      success: false,
      message: "API Gateway proxy error",
      error: err.message,
    });
  },
});

// Auth Service
app.use(
  "/api/auth",
  createProxyMiddleware(proxyOptions(process.env.AUTH_SERVICE_URL)),
);

// User Service
app.use(
  "/api/users",
  createProxyMiddleware(proxyOptions(process.env.USER_SERVICE_URL)),
);

// Hotel Service
app.use(
  "/api/hotels",
  createProxyMiddleware(proxyOptions(process.env.HOTEL_SERVICE_URL)),
);

// Food Service
app.use(
  "/api/foods",
  createProxyMiddleware(proxyOptions(process.env.FOOD_SERVICE_URL)),
);

// Cart Service
app.use(
  "/api/cart",
  createProxyMiddleware(proxyOptions(process.env.CART_SERVICE_URL)),
);

// Order Service
app.use(
  "/api/orders",
  createProxyMiddleware(proxyOptions(process.env.ORDER_SERVICE_URL)),
);

// Payment Service
app.use(
  "/api/payments",
  createProxyMiddleware(proxyOptions(process.env.PAYMENT_SERVICE_URL)),
);

// AI Service FastAPI
app.use(
  "/api/ai",
  createProxyMiddleware(proxyOptions(process.env.AI_SERVICE_URL)),
);

// Notification Service
app.use(
  "/api/notifications",
  createProxyMiddleware(proxyOptions(process.env.NOTIFICATION_SERVICE_URL)),
);

// Admin Service
app.use(
  "/api/admin",
  createProxyMiddleware(proxyOptions(process.env.ADMIN_SERVICE_URL)),
);

// Review Rating Service
app.use(
  "/api/reviews",
  createProxyMiddleware(proxyOptions(process.env.REVIEW_SERVICE_URL)),
);

// Delivery Tracking Service
app.use(
  "/api/delivery",
  createProxyMiddleware(proxyOptions(process.env.DELIVERY_SERVICE_URL)),
);

// Recommendation Service
app.use(
  "/api/recommendations",
  createProxyMiddleware(proxyOptions(process.env.RECOMMENDATION_SERVICE_URL)),
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
