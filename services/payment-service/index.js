const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const paymentRoutes = require('./routes/payment.routes');

const app = express();

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(cors());

app.use('/api/payments', paymentRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Payment DB connected'))
  .catch(err => console.log(err));

app.listen(process.env.PORT || 4005, () =>
  console.log('Payment service running on port 4005'));