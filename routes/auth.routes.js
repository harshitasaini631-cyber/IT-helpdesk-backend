
const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser
} = require("../controllers/auth.controller");

const {
    authenticateUser
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get logged-in user's profile
router.get("/profile", authenticateUser, (req, res) => {
    res.status(200).json({
        message: "Authenticated successfully",
        user: req.user
    });
});

// Admin-only test route
router.get(
    "/admin-test",
    authenticateUser,
    authorizeRoles(5),
    (req, res) => {
        res.status(200).json({
            message: "Welcome, Administrator!"
        });
    }
);

module.exports = router;
