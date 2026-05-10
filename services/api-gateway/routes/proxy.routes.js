const { createProxyMiddleware } = require("http-proxy-middleware");
const {
  authLimiter,
  aiLimiter,
} = require("../middleware/rateLimit.middleware");

const setupRoutes = (app) => {
  // Auth Service
  app.use(
    "/api/auth",
    authLimiter,
    createProxyMiddleware({
      target: "http://localhost:4001",
      changeOrigin: true,
    }),
  );

  // User Service
  app.use(
    "/api/users",
    createProxyMiddleware({
      target: "http://localhost:4008",
      changeOrigin: true,
    }),
  );

  // Hotel Service
  app.use(
    "/api/hotels",
    createProxyMiddleware({
      target: "http://localhost:4002",
      changeOrigin: true,
    }),
  );

  app.use(
    "/api/foods",
    createProxyMiddleware({
      target: "http://localhost:4002",
      changeOrigin: true,
    }),
  );

  // Location Service
  app.use(
    "/api/location",
    createProxyMiddleware({
      target: "http://localhost:4003",
      changeOrigin: true,
    }),
  );

  // Order Service
  app.use(
    "/api/orders",
    createProxyMiddleware({
      target: "http://localhost:4004",
      changeOrigin: true,
    }),
  );

  app.use(
    "/api/cart",
    createProxyMiddleware({
      target: "http://localhost:4004",
      changeOrigin: true,
    }),
  );

  // Payment Service
  app.use(
    "/api/payments",
    createProxyMiddleware({
      target: "http://localhost:4005",
      changeOrigin: true,
    }),
  );

  // Notification Service
  app.use(
    "/api/notifications",
    createProxyMiddleware({
      target: "http://localhost:4006",
      changeOrigin: true,
    }),
  );

  // RAG AI Service
  app.use(
    "/api/ai",
    aiLimiter,
    createProxyMiddleware({
      target: "http://localhost:4007",
      changeOrigin: true,
      proxyTimeout: 60000,
      timeout: 60000,
    }),
  );
};

module.exports = setupRoutes;
