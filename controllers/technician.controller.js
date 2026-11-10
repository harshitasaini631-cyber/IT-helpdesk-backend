
const db = require("../config/db");

const getAllTechnicians = (req, res) => {

    const sql = `
        SELECT
            t.technician_id,
            u.user_id,
            u.name AS technician_name,
            u.email,
            t.specialization,
            t.availability_status,
            st.team_name
        FROM TECHNICIAN t
        JOIN USER u
            ON t.user_id = u.user_id
        LEFT JOIN SUPPORT_TEAM st
            ON t.team_id = st.team_id
        ORDER BY t.technician_id;
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Error fetching technicians:", err);

            return res.status(500).json({
                message: "Failed to fetch technicians"
            });
        }

        res.status(200).json({
            message: "Technicians fetched successfully",
            total: results.length,
            technicians: results
        });
    });
};


const getTechnicianById = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            t.technician_id,
            u.user_id,
            u.name AS technician_name,
            u.email,
            t.specialization,
            t.availability_status,
            st.team_name
        FROM TECHNICIAN t
        JOIN USER u
            ON t.user_id = u.user_id
        LEFT JOIN SUPPORT_TEAM st
            ON t.team_id = st.team_id
        WHERE t.technician_id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Error fetching technician:", err);

            return res.status(500).json({
                message: "Failed to fetch technician"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Technician not found"
            });
        }

        res.status(200).json({
            message: "Technician fetched successfully",
            technician: results[0]
        });
    });
};



const updateTechnician = (req, res) => {
    const { id } = req.params;

    const {
        specialization,
        availability_status,
        team_id
    } = req.body;

    const sql = `
        UPDATE TECHNICIAN
        SET
            specialization = ?,
            availability_status = ?,
            team_id = ?
        WHERE technician_id = ?
    `;

    const values = [
        specialization,
        availability_status,
        team_id,
        id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating technician:", err);

            return res.status(500).json({
                message: "Failed to update technician"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Technician not found or no changes made"
            });
        }

        res.status(200).json({
            message: "Technician updated successfully"
        });
    });
};



const deactivateTechnician = (req, res) => {
    const { id } = req.params;

    const sql = `
        UPDATE TECHNICIAN
        SET availability_status = 'Inactive'
        WHERE technician_id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error deactivating technician:", err);

            return res.status(500).json({
                message: "Failed to deactivate technician"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Technician not found or already inactive"
            });
        }

        res.status(200).json({
            message: "Technician deactivated successfully"
        });
    });
};


module.exports = {
    getAllTechnicians,
    getTechnicianById,
    updateTechnician,
    deactivateTechnician
};