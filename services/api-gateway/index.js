const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
require('dotenv').config();

const verifyToken   = require('./middleware/auth.middleware');
const logger        = require('./middleware/logger.middleware');
const { generalLimiter } = require('./middleware/rateLimit.middleware');
const setupRoutes   = require('./routes/proxy.routes');

const app  = express();
const PORT = process.env.PORT || 5000;


app.use(helmet());          
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,        
}));

app.use(logger);



app.use(generalLimiter);
app.use(express.json());
app.use(verifyToken);
app.get('/health', (req, res) => {
  res.json({
    status:   'ok',
    service:  'Go-Eat API Gateway',
    port:     PORT,
    services: {
      auth:         process.env.AUTH_SERVICE_URL,
      hotel:        process.env.HOTEL_SERVICE_URL,
      location:     process.env.LOCATION_SERVICE_URL,
      order:        process.env.ORDER_SERVICE_URL,
      payment:      process.env.PAYMENT_SERVICE_URL,
      notification: process.env.NOTIFICATION_SERVICE_URL,
      ai:           process.env.AI_SERVICE_URL,
    },
  });
});
setupRoutes(app);

app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.path} not found`,
  });
});
app.use((err, req, res, next) => {
  console.error('Gateway error:', err.message);
  res.status(500).json({
    message: 'Internal gateway error',
  });
});
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`  Go-Eat API Gateway running on port ${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/health`);
  console.log(`${'='.repeat(50)}\n`);
  console.log('  Routing:');
  console.log(`  /api/auth/*          → port 4001`);
  console.log(`  /api/hotels/*        → port 4002`);
  console.log(`  /api/foods/*         → port 4002`);
  console.log(`  /api/location/*      → port 4003`);
  console.log(`  /api/orders/*        → port 4004`);
  console.log(`  /api/cart/*          → port 4004`);
  console.log(`  /api/payments/*      → port 4005`);
  console.log(`  /api/notifications/* → port 4006`);
  console.log(`  /api/ai/*            → port 4007`);
  console.log(`${'='.repeat(50)}\n`);
});