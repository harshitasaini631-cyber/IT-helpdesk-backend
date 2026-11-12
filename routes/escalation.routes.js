const { authorizeRoles } = require("../middleware/role.middleware");
const { authenticateUser } = require("../middleware/auth.middleware");
const express = require("express");
const router = express.Router();

const {
    getAllEscalations,
    getEscalationById,
    createEscalation,
    updateEscalation,
    deleteEscalation
} = require("../controllers/escalation.controller");

router.get(
    "/",
    authenticateUser,
    authorizeRoles(2, 3, 4, 5),
    getAllEscalations
);

router.get(
    "/:id",
    authenticateUser,
    authorizeRoles(2, 3, 4, 5),
    getEscalationById
);

router.post(
    "/",
    authenticateUser,
    authorizeRoles(2, 4, 5),
    createEscalation
);

router.put(
    "/:id",
    authenticateUser,
    authorizeRoles(2, 4, 5),
    updateEscalation
);

router.delete(
    "/:id",
    authenticateUser,
    authorizeRoles(5),
    deleteEscalation
);

module.exports = router;