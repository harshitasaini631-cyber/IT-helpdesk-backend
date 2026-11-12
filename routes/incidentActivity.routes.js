const express = require("express");
const router = express.Router();

const {
    createActivity,
    getAllActivities,
    getActivitiesByIncident,
    updateActivity,
    deleteActivity
} = require("../controllers/incidentActivity.controller");

const { authenticateUser } = require("../middleware/auth.middleware");

// Get all activities
router.get("/", authenticateUser, getAllActivities);

// Get activities for a particular incident
router.get("/incident/:incident_id", authenticateUser, getActivitiesByIncident);

// Create activity
router.post("/", authenticateUser, createActivity);

// Update activity
router.put("/:id", authenticateUser, updateActivity);

// Delete activity
router.delete("/:id", authenticateUser, deleteActivity);

module.exports = router;