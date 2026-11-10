
const db = require("../config/db");

// Get all escalations
const getAllEscalations = (req, res) => {
    const sql = `
        SELECT
            e.*,
            i.ticket_number,
            u.name AS escalated_by_name
        FROM ESCALATION e
        LEFT JOIN INCIDENT i
            ON e.incident_id = i.incident_id
        LEFT JOIN USER u
            ON e.escalated_by = u.user_id
        ORDER BY e.escalated_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch escalations"
            });
        }

        res.status(200).json({
            total: results.length,
            escalations: results
        });
    });
};


const getEscalationById = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            e.*,
            i.ticket_number,
            u.name AS escalated_by_name
        FROM ESCALATION e
        LEFT JOIN INCIDENT i
            ON e.incident_id = i.incident_id
        LEFT JOIN USER u
            ON e.escalated_by = u.user_id
        WHERE e.escalation_id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch escalation"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Escalation not found"
            });
        }

        res.status(200).json(results[0]);
    });
};


const createEscalation = (req, res) => {
    const {
        incident_id,
        escalation_level,
        reason,
        status
    } = req.body;

    const escalated_by = req.user.user_id;
    const sql = `
        INSERT INTO ESCALATION
        (
            incident_id,
            escalated_by,
            escalation_level,
            reason,
            escalated_at,
            status
        )
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
    `;

    const values = [
        incident_id,
        escalated_by,
        escalation_level,
        reason,
        status || "Pending"
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to create escalation"
            });
        }

        res.status(201).json({
            message: "Escalation created successfully",
            escalation_id: result.insertId
        });
    });
};


const updateEscalation = (req, res) => {
    const { id } = req.params;

    const {
        escalation_level,
        reason,
        status
    } = req.body;

    const sql = `
        UPDATE ESCALATION
        SET
            escalation_level = ?,
            reason = ?,
            status = ?
        WHERE escalation_id = ?
    `;

    const values = [
        escalation_level,
        reason,
        status,
        id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to update escalation"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Escalation not found or no changes made"
            });
        }

        res.status(200).json({
            message: "Escalation updated successfully"
        });
    });
};



const deleteEscalation = (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM ESCALATION
        WHERE escalation_id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to delete escalation"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Escalation not found"
            });
        }

        res.status(200).json({
            message: "Escalation deleted successfully"
        });
    });
};



module.exports = {
    getAllEscalations,
    getEscalationById,
    createEscalation,
    updateEscalation,
    deleteEscalation
};