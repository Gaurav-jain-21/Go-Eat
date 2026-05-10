const router = require("express").Router();
const {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
  getMe,
} = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/verifyToken");

router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refreshToken);

router.get("/me", verifyToken, getMe);

module.exports = router;
