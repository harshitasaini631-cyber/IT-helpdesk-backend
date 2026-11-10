const { authenticateUser } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const express = require("express");
const router = express.Router();

const {
    getAllSLARecords,
    getOverdueIncidents
} = require("../controllers/sla.controller");

router.get("/", authenticateUser, getAllSLARecords);

router.get(
    "/overdue",
    authenticateUser,
    authorizeRoles(4, 5),
    getOverdueIncidents
);

module.exports = router;
