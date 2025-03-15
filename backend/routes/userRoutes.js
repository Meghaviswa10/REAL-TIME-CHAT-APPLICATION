const express = require("express");
const {
  authUser,
  allUsers,
  registerUser,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, allUsers);
router.route("/").post(registerUser);
router.post("/login", authUser);

router.get("/protectedRoute", protect, (req, res) => {
  res.status(200).json({ message: "This is a protected route!" });
});

module.exports = router;
