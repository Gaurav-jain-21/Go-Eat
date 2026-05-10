const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const verifyToken = require("./middleware/auth.middleware");
const logger = require("./middleware/logger.middleware");
const { generalLimiter } = require("./middleware/rateLimit.middleware");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*", credentials: true }));
app.use(logger);
app.use(generalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(verifyToken);

// ── Health check ──
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Go-Eat API Gateway",
    port: PORT,
    services: {
      auth: process.env.AUTH_SERVICE_URL,
      user: process.env.USER_SERVICE_URL,
      hotel: process.env.HOTEL_SERVICE_URL,
      location: process.env.LOCATION_SERVICE_URL,
      order: process.env.ORDER_SERVICE_URL,
      payment: process.env.PAYMENT_SERVICE_URL,
      notification: process.env.NOTIFICATION_SERVICE_URL,
      ai: process.env.AI_SERVICE_URL,
    },
  });
});

// ── Proxy helper ──
const proxyRequest = (serviceUrl) => async (req, res) => {
  try {
    const url = `${serviceUrl}${req.originalUrl}`;

    const config = {
      method: req.method,
      url,
      // only forward necessary headers
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers["authorization"] || "",
        "x-user-id": req.headers["x-user-id"] || "",
        "x-user-role": req.headers["x-user-role"] || "",
        "x-user-email": req.headers["x-user-email"] || "",
      },
      timeout: 10000,
    };

    // only add body for non-GET requests
    if (req.method !== "GET" && req.method !== "DELETE") {
      config.data = req.body;
    }

    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      // service returned an error (4xx, 5xx)
      return res.status(err.response.status).json(err.response.data);
    }
    if (err.code === "ECONNREFUSED") {
      console.error(`Service down at ${serviceUrl}`);
      return res
        .status(503)
        .json({
          message: "Service is not running. Please start all services.",
        });
    }
    if (err.code === "ETIMEDOUT" || err.code === "ECONNABORTED") {
      console.error(`Service timeout at ${serviceUrl}`);
      return res
        .status(503)
        .json({ message: "Service timeout. Please try again." });
    }
    console.error(`Proxy error [${serviceUrl}]:`, err.message);
    res.status(503).json({ message: err.message });
  }
};

// ── All Routes ──
app.use("/api/auth", proxyRequest(process.env.AUTH_SERVICE_URL));
app.use("/api/users", proxyRequest(process.env.USER_SERVICE_URL));
app.use("/api/hotels", proxyRequest(process.env.HOTEL_SERVICE_URL));
app.use("/api/foods", proxyRequest(process.env.HOTEL_SERVICE_URL));
app.use("/api/location", proxyRequest(process.env.LOCATION_SERVICE_URL));
app.use("/api/orders", proxyRequest(process.env.ORDER_SERVICE_URL));
app.use("/api/cart", proxyRequest(process.env.ORDER_SERVICE_URL));
app.use("/api/payments", proxyRequest(process.env.PAYMENT_SERVICE_URL));
app.use(
  "/api/notifications",
  proxyRequest(process.env.NOTIFICATION_SERVICE_URL),
);
app.use("/api/ai", proxyRequest(process.env.AI_SERVICE_URL));

// ── 404 ──
app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Route ${req.method} ${req.path} not found` });
});

app.listen(PORT, () => {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`  Go-Eat API Gateway running on port ${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/health`);
  console.log(`${"=".repeat(50)}`);
  console.log("  /api/auth/*          → 4001");
  console.log("  /api/users/*         → 4008");
  console.log("  /api/hotels/*        → 4002");
  console.log("  /api/foods/*         → 4002");
  console.log("  /api/location/*      → 4003");
  console.log("  /api/orders/*        → 4004");
  console.log("  /api/cart/*          → 4004");
  console.log("  /api/payments/*      → 4005");
  console.log("  /api/notifications/* → 4006");
  console.log("  /api/ai/*            → 4007");
  console.log(`${"=".repeat(50)}\n`);
});
