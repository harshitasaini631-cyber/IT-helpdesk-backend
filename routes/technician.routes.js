const { authorizeRoles } = require("../middleware/role.middleware");
const { authenticateUser } = require("../middleware/auth.middleware");
const express = require("express");
const router = express.Router();

const {
    getAllTechnicians,
    getTechnicianById,
    updateTechnician,
    deactivateTechnician
} = require("../controllers/technician.controller");

router.get("/", authenticateUser, getAllTechnicians);
router.get("/:id", authenticateUser, getTechnicianById);

router.put(
    "/:id",
    authenticateUser,
    authorizeRoles(4, 5),
    updateTechnician
);

router.patch(
    "/:id/deactivate",
    authenticateUser,
    authorizeRoles(4, 5),
    deactivateTechnician
);
module.exports = router;
