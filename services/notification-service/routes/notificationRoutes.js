const express = require("express");

const {
  createNotification,
  getUserNotifications,
  markAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", protect, createNotification);

router.get("/user", protect, getUserNotifications);

router.patch("/read/:id", protect, markAsRead);

router.delete("/:id", protect, deleteNotification);

module.exports = router;
