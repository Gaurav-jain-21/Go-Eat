const Order = require("../models/Order");
const Cart = require("../models/Cart");
const axios = require("axios");

// ─────────────────────────────────────────────
// POST /api/orders/place
// User places an order from their cart
// ─────────────────────────────────────────────
exports.placeOrder = async (req, res) => {
  try {
    const { paymentMethod, paymentId, deliveryAddress } = req.body;

    // get user's cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    // collect unique hotel IDs from cart items
    const hotelIds = [...new Set(cart.items.map((i) => i.hotel.toString()))];

    // calculate total amount
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // create the order in DB
    const order = await Order.create({
      user: req.user.id,
      items: cart.items,
      hotels: hotelIds,
      totalAmount,
      paymentMethod,
      paymentId,
      paymentStatus: paymentId ? "paid" : "pending",
      deliveryAddress,
      status: "Placed",
    });

    // clear cart after order is placed
    await Cart.findOneAndDelete({ user: req.user.id });

    // notify user — order placed
    // .catch so notification failure never crashes order placement
    axios
      .post(
        `${process.env.NOTIFICATION_SERVICE_URL}/api/notifications/order-placed`,
        {
          userId: req.user.id,
          userEmail: req.user.email,
          userPhone: req.user.phone,
          orderId: order._id,
          totalAmount: order.totalAmount,
          hotelName:
            cart.items[0]?.hotelName || "the restaurant",
        }
      )
      .catch((err) =>
        console.error("Order placed notification failed:", err.message)
      );

    res.status(201).json({ message: "Order placed successfully!", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/orders/my-orders
// Logged-in user sees all their past orders
// ─────────────────────────────────────────────
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.food", "name image")
      .populate("items.hotel", "name")
      .sort({ createdAt: -1 }); // newest first

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/orders/:id
// Get single order detail — user or admin only
// ─────────────────────────────────────────────
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.food", "name image price")
      .populate("items.hotel", "name address");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // only the owner or admin can view this order
    if (order.user.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// PUT /api/orders/:id/status
// Hotel or admin updates order status
// Placed → Confirmed → Preparing → Out for Delivery → Delivered
// ─────────────────────────────────────────────
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // only hotel or admin can update status
    if (req.user.role !== "hotel" && req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const validStatuses = [
      "Confirmed",
      "Preparing",
      "Out for Delivery",
      "Delivered",
    ];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    order.status = status;

    // record exact timestamp for each status change
    if (status === "Confirmed")        order.confirmedAt  = new Date();
    if (status === "Preparing")        order.preparingAt  = new Date();
    if (status === "Out for Delivery") order.dispatchedAt = new Date();
    if (status === "Delivered")        order.deliveredAt  = new Date();

    await order.save();

    // notify user about status change
    axios
      .post(
        `${process.env.NOTIFICATION_SERVICE_URL}/api/notifications/status-update`,
        {
          userId:   order.user,
          orderId:  order._id,
          status:   status,
        }
      )
      .catch((err) =>
        console.error("Status notification failed:", err.message)
      );

    res.json({ message: `Order status updated to ${status}`, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/orders/:id/cancel
// User cancels their order + triggers refund
// Can only cancel if status is Placed or Confirmed
// ─────────────────────────────────────────────
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // only the user who placed the order can cancel it
    if (order.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Access denied" });

    // can only cancel before kitchen starts preparing
    const cancellable = ["Placed", "Confirmed"];
    if (!cancellable.includes(order.status))
      return res.status(400).json({
        message: `Cannot cancel — order is already ${order.status}`,
      });

    order.status      = "Cancelled";
    order.cancelledAt = new Date();

    // trigger refund if payment was made
    if (order.paymentStatus === "paid" && order.paymentId) {
      try {
        const refundRes = await axios.post(
          `${process.env.PAYMENT_SERVICE_URL}/api/payments/refund`,
          {
            paymentId:     order.paymentId,
            amount:        order.totalAmount,
            paymentMethod: order.paymentMethod,
          }
        );

        order.refundId      = refundRes.data.refundId;
        order.refundStatus  = "initiated";
        order.paymentStatus = "refunded";

      } catch (refundErr) {
        // refund failed — still cancel order, flag for admin to handle manually
        console.error("Refund failed:", refundErr.message);
        order.refundStatus = "none";
      }
    }

    await order.save();

    // notify user about cancellation + refund
    axios
      .post(
        `${process.env.NOTIFICATION_SERVICE_URL}/api/notifications/order-cancelled`,
        {
          userId:      order.user,
          orderId:     order._id,
          totalAmount: order.totalAmount,
        }
      )
      .catch((err) =>
        console.error("Cancellation notification failed:", err.message)
      );

    res.json({ message: "Order cancelled. Refund initiated.", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/orders/hotel/incoming
// Hotel sees all orders assigned to them
// ─────────────────────────────────────────────
exports.getHotelOrders = async (req, res) => {
  try {
    const orders = await Order.find({ hotels: req.user.hotelId })
      .populate("user",       "name email")
      .populate("items.food", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/orders/admin/all
// Admin sees every order on the platform
// ─────────────────────────────────────────────
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user",        "name email")
      .populate("items.hotel", "name")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
