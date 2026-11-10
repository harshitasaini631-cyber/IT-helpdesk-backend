const { authenticateUser } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const express = require("express");
const router = express.Router();

const {
    getAllIncidents,
    createIncident,
    getIncidentById,
    updateIncident,
    deleteIncident,
    assignTechnician,
    getIncidentHistory,
    resolveIncident
} = require("../controllers/incident.controller");

router.get("/", authenticateUser, getAllIncidents);
router.post("/", authenticateUser, createIncident);
router.get("/:id", authenticateUser, getIncidentById);
router.put("/:id", authenticateUser, updateIncident);
router.delete(
    "/:id",
    authenticateUser,
    authorizeRoles(5),
    deleteIncident
);
router.patch("/:id/assign", authenticateUser, assignTechnician);
router.get("/:id/history", authenticateUser, getIncidentHistory);
router.post("/:id/resolve", authenticateUser, resolveIncident);
module.exports = router;
