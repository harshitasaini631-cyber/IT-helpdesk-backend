const { authorizeRoles } = require("../middleware/role.middleware");
const { authenticateUser } = require("../middleware/auth.middleware");
const express = require("express");
const router = express.Router();

const {
    getAllAssets,
    getAssetById,
    createAsset,
    updateAsset,
    deleteAsset
} = require("../controllers/asset.controller");

router.get("/", authenticateUser, getAllAssets);
router.get("/:id", authenticateUser, getAssetById);

router.post(
    "/",
    authenticateUser,
    authorizeRoles(4, 5),
    createAsset
);

router.put(
    "/:id",
    authenticateUser,
    authorizeRoles(4, 5),
    updateAsset
);

router.delete(
    "/:id",
    authenticateUser,
    authorizeRoles(5),
    deleteAsset
);

module.exports = router;