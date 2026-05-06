const Order = require("../models/Order");
const Cart = require("../models/Cart");
const axios = require("axios");

exports.placeOrder = async (req, res) => {
  try {
    const { paymentMethod, paymentId, deliveryAddress } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    const hotelIds = [...new Set(cart.items.map((i) => i.hotel.toString()))];

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

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

    await Cart.findOneAndDelete({ user: req.user.id });

    console.log(`New order ${order._id} for hotels: ${hotelIds}`);

    res.status(201).json({ message: "Order placed successfully!", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.food", "name image")
      .populate("items.hotel", "name")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.food", "name image price")
      .populate("items.hotel", "name address");

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

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

    if (status === "Confirmed") order.confirmedAt = new Date();
    if (status === "Preparing") order.preparingAt = new Date();
    if (status === "Out for Delivery") order.dispatchedAt = new Date();
    if (status === "Delivered") order.deliveredAt = new Date();

    await order.save();
    res.json({ message: `Order status updated to ${status}`, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Access denied" });

    const cancellable = ["Placed", "Confirmed"];
    if (!cancellable.includes(order.status))
      return res.status(400).json({
        message: `Cannot cancel — order is already ${order.status}`,
      });

    order.status = "Cancelled";
    order.cancelledAt = new Date();

    if (order.paymentStatus === "paid" && order.paymentId) {
      try {
        const refundRes = await axios.post(
          `${process.env.PAYMENT_SERVICE_URL}/api/payments/refund`,
          {
            paymentId: order.paymentId,
            amount: order.totalAmount,
            paymentMethod: order.paymentMethod,
          },
        );

        order.refundId = refundRes.data.refundId;
        order.refundStatus = "initiated";
        order.paymentStatus = "refunded";
      } catch (refundErr) {
        console.error("Refund failed:", refundErr.message);

        order.refundStatus = "none";
      }
    }

    await order.save();
    res.json({ message: "Order cancelled. Refund initiated.", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getHotelOrders = async (req, res) => {
  try {
    const orders = await Order.find({ hotels: req.user.hotelId })
      .populate("user", "name email")
      .populate("items.food", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.hotel", "name")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
