const { createProxyMiddleware } = require('http-proxy-middleware');
const { authLimiter, aiLimiter } = require('../middleware/rateLimit.middleware');

const proxyOptions = (target) => ({
  target,
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      console.error(`Proxy error for ${req.path}:`, err.message);
      res.status(503).json({
        message: 'Service temporarily unavailable. Please try again.',
        service: target,
      });
    },
  },
});

const setupRoutes = (app) => {
  app.use(
    '/api/auth',
    authLimiter,    
    createProxyMiddleware(proxyOptions(process.env.AUTH_SERVICE_URL))
  );
  app.use(
    '/api/hotels',
    createProxyMiddleware(proxyOptions(process.env.HOTEL_SERVICE_URL))
  );
  app.use(
    '/api/foods',
    createProxyMiddleware(proxyOptions(process.env.HOTEL_SERVICE_URL))
  );
  app.use(
    '/api/location',
    createProxyMiddleware(proxyOptions(process.env.LOCATION_SERVICE_URL))
  );
  app.use(
    '/api/orders',
    createProxyMiddleware(proxyOptions(process.env.ORDER_SERVICE_URL))
  );
  app.use(
    '/api/cart',
    createProxyMiddleware(proxyOptions(process.env.ORDER_SERVICE_URL))
  );
  app.use(
    '/api/payments',
    createProxyMiddleware(proxyOptions(process.env.PAYMENT_SERVICE_URL))
  );
  app.use(
    '/api/notifications',
    createProxyMiddleware(proxyOptions(process.env.NOTIFICATION_SERVICE_URL))
  );
  app.use(
    '/api/ai',
    aiLimiter,    
    createProxyMiddleware({
      ...proxyOptions(process.env.AI_SERVICE_URL),
      proxyTimeout: 60000,  // 60 seconds
      timeout:      60000,
    })
  );

};

module.exports = setupRoutes;