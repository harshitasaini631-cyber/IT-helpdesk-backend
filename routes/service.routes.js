const { authenticateUser } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const express = require("express");
const router = express.Router();

const {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService
} = require("../controllers/service.controller");

router.get("/", authenticateUser, getAllServices);
router.get("/:id", authenticateUser, getServiceById);

router.post(
    "/",
    authenticateUser,
    authorizeRoles(4, 5),
    createService
);

router.put(
    "/:id",
    authenticateUser,
    authorizeRoles(4, 5),
    updateService
);

router.delete(
    "/:id",
    authenticateUser,
    authorizeRoles(5),
    deleteService
);

module.exports = router;