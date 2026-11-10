const { authenticateUser } = require("../middleware/auth.middleware");
const express = require("express");
const router = express.Router();

const {
    createFeedback
} = require("../controllers/feedback.controller");

// POST submit feedback
router.post("/", authenticateUser, createFeedback);

module.exports = router;
