const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const http     = require('http');     // needed for Socket.io
const { Server } = require('socket.io');
require('dotenv').config();

const notificationRoutes = require('./routes/notification.routes');
const { setIO }          = require('./utils/socketManager');

const app    = express();
const server = http.createServer(app);  // wrap express in http server

// ── Socket.io setup ──
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// give io instance to socketManager so controllers can use it
setIO(io);

// ── Socket.io connection handler ──
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // user joins their own room using their userId
  // frontend sends: socket.emit('join', userId)
  socket.on('join', (userId) => {
    socket.join(userId.toString());
    console.log(`User ${userId} joined their notification room`);
  });

  // hotel joins their own room for incoming order alerts
  socket.on('joinHotel', (hotelId) => {
    socket.join(`hotel_${hotelId}`);
    console.log(`Hotel ${hotelId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// ── Express middleware ──
app.use(express.json());
app.use(cors());
app.use('/api/notifications', notificationRoutes);

// ── DB + Server ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Notification DB connected');
    server.listen(process.env.PORT || 4006, () =>
      console.log('Notification service running on port 4006')
    );
  })
  .catch(err => console.log(err));