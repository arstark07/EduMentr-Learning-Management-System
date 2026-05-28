const authMiddleware = require(
  "../middleware/authMiddleware"
);

const upload = require(
  "../middleware/upload"
);

const express = require("express");

const router = express.Router();

const {
  signup,
  login,
  updateProfile,
} = require("../controllers/authController");

router.post("/signup", signup);

router.post("/login", login);

router.put(
  "/profile",
  authMiddleware,
  upload.single("profilePic"),
  updateProfile
);

module.exports = router;