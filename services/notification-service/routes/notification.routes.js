const router = require('express').Router();
const { verifyToken } = require('../middleware/verifyToken');
const {
  notifyOrderPlaced,
  notifyStatusUpdate,
  notifyOrderCancelled,
  notifyRefundCompleted,
  getMyNotifications,
  markAsRead,
  markAllRead,
  getUnreadCount,
} = require('../controllers/notification.controller');

router.post('/order-placed',       notifyOrderPlaced);
router.post('/status-update',      notifyStatusUpdate);
router.post('/order-cancelled',    notifyOrderCancelled);
router.post('/refund-completed',   notifyRefundCompleted);
router.get('/my',                  verifyToken, getMyNotifications);
router.get('/unread-count',        verifyToken, getUnreadCount);
router.put('/:id/read',            verifyToken, markAsRead);
router.put('/mark-all-read',       verifyToken, markAllRead);

module.exports = router;