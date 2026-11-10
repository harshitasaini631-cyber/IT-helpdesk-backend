const { authorizeRoles } = require("../middleware/role.middleware");
const { authenticateUser } = require("../middleware/auth.middleware");
const express = require("express");
const router = express.Router();

const {
    getAllProblems,
    getProblemById,
    createProblem,
    updateProblem,
    deleteProblem
} = require("../controllers/problem.controller");

router.get("/", authenticateUser, getAllProblems);
router.get("/:id", authenticateUser, getProblemById);

router.post(
    "/",
    authenticateUser,
    authorizeRoles(2, 4, 5),
    createProblem
);

router.put(
    "/:id",
    authenticateUser,
    authorizeRoles(2, 4, 5),
    updateProblem
);

router.delete(
    "/:id",
    authenticateUser,
    authorizeRoles(5),
    deleteProblem
);

module.exports = router;