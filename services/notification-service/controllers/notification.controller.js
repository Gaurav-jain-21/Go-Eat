const Notification = require('../models/Notification');
const sendEmail    = require('../utils/sendEmail');
const sendSMS      = require('../utils/sendSMS');
const { emitToUser } = require('../utils/socketManager');

// ─────────────────────────────────────────────────────
// Core function — called internally to send all channels
// ─────────────────────────────────────────────────────
const sendNotification = async ({
  userId,
  userEmail,
  userPhone,
  title,
  message,
  type,
  orderId,
  emailBody,
  emailSubject,
  useEmail = true,
  useSMS   = true,
  useInApp = true,
}) => {
  const channels = { email: false, sms: false, inApp: false };

  // ── 1. Save to DB (always) ──
  const notification = await Notification.create({
    user:    userId,
    title,
    message,
    type,
    orderId,
    channels,
  });

  // ── 2. In-App via Socket.io ──
  if (useInApp) {
    emitToUser(userId, 'notification', {
      id:      notification._id,
      title,
      message,
      type,
      orderId,
      createdAt: notification.createdAt,
    });
    channels.inApp = true;
  }

  // ── 3. Email ──
  if (useEmail && userEmail) {
    const sent = await sendEmail({
      to:      userEmail,
      subject: emailSubject || title,
      title,
      body:    emailBody || `<p>${message}</p>`,
    });
    channels.email = sent;
  }

  // ── 4. SMS ──
  if (useSMS && userPhone) {
    const sent = await sendSMS({
      to:      userPhone,
      message: `FoodApp: ${message}`,
    });
    channels.sms = sent;
  }

  // update channels used
  notification.channels = channels;
  await notification.save();

  return notification;
};

// ─────────────────────────────────────────────────────
// POST /api/notifications/order-placed
// Called by Order Service after order is placed
// ─────────────────────────────────────────────────────
exports.notifyOrderPlaced = async (req, res) => {
  try {
    const { userId, userEmail, userPhone, orderId, totalAmount, hotelName } = req.body;

    await sendNotification({
      userId,
      userEmail,
      userPhone,
      title:   'Order Placed Successfully! 🎉',
      message: `Your order from ${hotelName} worth ₹${totalAmount} has been placed.`,
      type:    'order_placed',
      orderId,
      emailSubject: 'Order Confirmed — FoodApp',
      emailBody: `
        <p>Hi there! Your order has been placed successfully.</p>
        <table style="width:100%; border-collapse:collapse;">
          <tr><td style="padding:8px; border-bottom:1px solid #eee;"><strong>Order ID</strong></td>
              <td style="padding:8px; border-bottom:1px solid #eee;">${orderId}</td></tr>
          <tr><td style="padding:8px; border-bottom:1px solid #eee;"><strong>Restaurant</strong></td>
              <td style="padding:8px; border-bottom:1px solid #eee;">${hotelName}</td></tr>
          <tr><td style="padding:8px;"><strong>Total</strong></td>
              <td style="padding:8px;">₹${totalAmount}</td></tr>
        </table>
        <a href="${process.env.CLIENT_URL}/orders/${orderId}" class="btn">Track Your Order</a>
      `,
    });

    res.json({ message: 'Order placed notification sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────
// POST /api/notifications/status-update
// Called by Hotel when they update order status
// ─────────────────────────────────────────────────────
exports.notifyStatusUpdate = async (req, res) => {
  try {
    const { userId, userEmail, userPhone, orderId, status } = req.body;

    // status-specific messages
    const statusMessages = {
      'Confirmed':        { msg: 'Your order has been confirmed by the restaurant! 👨‍🍳', sms: true,  email: false },
      'Preparing':        { msg: 'Your food is being prepared fresh! 🔥',                 sms: true,  email: false },
      'Out for Delivery': { msg: 'Your order is on the way! 🛵',                          sms: true,  email: false },
      'Delivered':        { msg: 'Your order has been delivered. Enjoy your meal! 😋',    sms: true,  email: true  },
    };

    const config = statusMessages[status] || { msg: `Order status: ${status}`, sms: true, email: false };

    await sendNotification({
      userId,
      userEmail,
      userPhone,
      title:        `Order ${status}`,
      message:      config.msg,
      type:         `order_${status.toLowerCase().replace(/ /g, '_')}`,
      orderId,
      useEmail:     config.email,
      useSMS:       config.sms,
      useInApp:     true,
      emailSubject: `Your order is ${status} — FoodApp`,
      emailBody:    `<p>${config.msg}</p>
                     <a href="${process.env.CLIENT_URL}/orders/${orderId}" class="btn">View Order</a>`,
    });

    res.json({ message: 'Status notification sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────
// POST /api/notifications/order-cancelled
// ─────────────────────────────────────────────────────
exports.notifyOrderCancelled = async (req, res) => {
  try {
    const { userId, userEmail, userPhone, orderId, totalAmount } = req.body;

    await sendNotification({
      userId,
      userEmail,
      userPhone,
      title:        'Order Cancelled',
      message:      `Your order has been cancelled. Refund of ₹${totalAmount} has been initiated.`,
      type:         'order_cancelled',
      orderId,
      useEmail:     true,
      useSMS:       true,
      useInApp:     true,
      emailSubject: 'Order Cancelled & Refund Initiated — FoodApp',
      emailBody: `
        <p>Your order has been cancelled successfully.</p>
        <p><strong>Refund Amount:</strong> ₹${totalAmount}</p>
        <p>The refund will be credited to your original payment method within <strong>5-7 working days</strong>.</p>
        <a href="${process.env.CLIENT_URL}/orders/${orderId}" class="btn">View Order</a>
      `,
    });

    res.json({ message: 'Cancellation notification sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────
// POST /api/notifications/refund-completed
// Called by webhook when refund finishes
// ─────────────────────────────────────────────────────
exports.notifyRefundCompleted = async (req, res) => {
  try {
    const { userId, userEmail, userPhone, orderId, refundAmount } = req.body;

    await sendNotification({
      userId,
      userEmail,
      userPhone,
      title:        'Refund Completed ✅',
      message:      `₹${refundAmount} has been refunded to your account.`,
      type:         'refund_completed',
      orderId,
      useEmail:     true,
      useSMS:       true,
      useInApp:     true,
      emailSubject: 'Refund Successful — FoodApp',
      emailBody: `
        <p>Good news! Your refund has been processed successfully.</p>
        <p><strong>Refund Amount:</strong> ₹${refundAmount}</p>
        <p>The amount should reflect in your account within 1-2 business days depending on your bank.</p>
      `,
    });

    res.json({ message: 'Refund notification sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────
// GET /api/notifications/my  — user's notification inbox
// ─────────────────────────────────────────────────────
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);  // last 50 notifications

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────
// PUT /api/notifications/:id/read  — mark as read
// ─────────────────────────────────────────────────────
exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/notifications/mark-all-read
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user:   req.user.id,
      isRead: false,
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};