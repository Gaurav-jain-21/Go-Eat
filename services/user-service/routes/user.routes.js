const router = require("express").Router();
const upload = require("../middleware/upload");
const { verifyToken, requireRole } = require("../middleware/verifyToken");
const {
  getProfile,
  updateProfile,
  changePassword,
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  getOrderHistory,
  deleteAccount,
  getAllUsers,
  toggleBlockUser,
} = require("../controllers/user.controller");

router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, upload.single("avatar"), updateProfile);
router.put("/change-password", verifyToken, changePassword);
router.get("/addresses", verifyToken, getAddresses);
router.post("/addresses", verifyToken, addAddress);
router.put("/addresses/:addressId", verifyToken, updateAddress);
router.delete("/addresses/:addressId", verifyToken, deleteAddress);
router.get("/orders", verifyToken, getOrderHistory);
router.delete("/account", verifyToken, deleteAccount);
router.get("/all", verifyToken, requireRole("admin"), getAllUsers);
router.put("/:id/block", verifyToken, requireRole("admin"), toggleBlockUser);

module.exports = router;
