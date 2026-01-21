const express = require("express");
const {
  requireAuth,
  requireAdmin,
  requireFounderOrCoFounder,
} = require("../../middlewares/requireAuth.middleware");
const {
  getUser,
  getUsers,
  deleteUser,
  updateUser,
  approveUser,
} = require("./user.controller");
const router = express.Router();

// middleware that is specific to this router
// router.use(requireAuth)

router.get("/", getUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.put("/:id/approve", requireAuth, requireFounderOrCoFounder, approveUser);
router.delete("/:id", requireAuth, requireAdmin, deleteUser);

module.exports = router;
