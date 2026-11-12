
const db = require("../config/db");

// Get all assets
const getAllAssets = (req, res) => {
    const sql = `
        SELECT
            a.*,
            u.name AS assigned_user_name,
            d.department_name
        FROM ASSET a
        LEFT JOIN USER u
            ON a.assigned_user_id = u.user_id
        LEFT JOIN DEPARTMENT d
            ON a.department_id = d.department_id
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch assets"
            });
        }

        res.status(200).json({
            total: results.length,
            assets: results
        });
    });
};



// Get asset by ID
const getAssetById = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            a.*,
            u.name AS assigned_user_name,
            d.department_name
        FROM ASSET a
        LEFT JOIN USER u
            ON a.assigned_user_id = u.user_id
        LEFT JOIN DEPARTMENT d
            ON a.department_id = d.department_id
        WHERE a.asset_id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch asset"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Asset not found"
            });
        }

        res.status(200).json(results[0]);
    });
};




const createAsset = (req, res) => {
    const {
        asset_tag,
        asset_name,
        asset_type,
        serial_number,
        assigned_user_id,
        department_id,
        purchase_date,
        asset_status
    } = req.body;

    // Validate required fields
    if (!asset_tag || !asset_name || !asset_type || !asset_status) {
        return res.status(400).json({
            message: "Asset tag, name, type and status are required"
        });
    }

    const sql = `
        INSERT INTO ASSET
        (
            asset_tag,
            asset_name,
            asset_type,
            serial_number,
            assigned_user_id,
            department_id,
            purchase_date,
            asset_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        asset_tag.trim(),
        asset_name.trim(),
        asset_type,
        serial_number || null,
        assigned_user_id || null,
        department_id || null,
        purchase_date || null,
        asset_status
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Asset tag or serial number already exists"
                });
            }

            console.error(err);
            return res.status(500).json({
                message: "Failed to create asset"
            });
        }

        return res.status(201).json({
            message: "Asset created successfully",
            asset_id: result.insertId
        });
    });
};





const updateAsset = (req, res) => {
    const { id } = req.params;

    const {
        asset_tag,
        asset_name,
        asset_type,
        serial_number,
        assigned_user_id,
        department_id,
        purchase_date,
        asset_status
    } = req.body;

    if (!asset_tag || !asset_name || !asset_type || !asset_status) {
        return res.status(400).json({
            message: "Asset tag, name, type and status are required"
        });
    }

    const sql = `
        UPDATE ASSET
        SET
            asset_tag = ?,
            asset_name = ?,
            asset_type = ?,
            serial_number = ?,
            assigned_user_id = ?,
            department_id = ?,
            purchase_date = ?,
            asset_status = ?
        WHERE asset_id = ?
    `;

    const values = [
        asset_tag.trim(),
        asset_name.trim(),
        asset_type,
        serial_number || null,
        assigned_user_id || null,
        department_id || null,
        purchase_date || null,
        asset_status,
        id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Asset tag or serial number already exists"
                });
            }

            console.error(err);
            return res.status(500).json({
                message: "Failed to update asset"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Asset not found or no changes made"
            });
        }

        return res.status(200).json({
            message: "Asset updated successfully"
        });
    });
};




const deleteAsset = (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM ASSET
        WHERE asset_id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to delete asset"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Asset not found"
            });
        }

        res.status(200).json({
            message: "Asset deleted successfully"
        });
    });
};


module.exports = {
    getAllAssets,
    getAssetById,
    createAsset,
    updateAsset,
    deleteAsset
};