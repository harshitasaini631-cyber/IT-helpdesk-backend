
const db = require("../config/db");

const getAllIncidents = (req, res) => {

    const sql = `
        SELECT
            i.incident_id,
            i.ticket_number,
            i.subject,
            i.description,
            u.name AS reported_by,
            p.priority_name,
            s.status_name,
            i.created_at
        FROM INCIDENT i
        JOIN USER u
            ON i.user_id = u.user_id
        JOIN PRIORITY p
            ON i.priority_id = p.priority_id
        JOIN INCIDENT_STATUS s
            ON i.status_id = s.status_id
        ORDER BY i.created_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Error fetching incidents:", err);
            return res.status(500).json({
                message: "Failed to fetch incidents"
            });
        }

        res.status(200).json({
            message: "Incidents fetched successfully",
            total: results.length,
            incidents: results
        });
    });
};



const createIncident = (req, res) => {
    const {
        ticket_number,
        category_id,
        priority_id,
        status_id,
        subject,
        description
    } = req.body;

    const user_id = req.user.user_id;
    const sql = `
        INSERT INTO INCIDENT
        (ticket_number, user_id, category_id, priority_id,
         status_id, subject, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        ticket_number,
        user_id,
        category_id,
        priority_id,
        status_id,
        subject,
        description
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to create incident"
            });
        }

        res.status(201).json({
            message: "Incident created successfully",
            incident_id: result.insertId
        });
    });
};



const getIncidentById = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            i.*,
            u.name AS reported_by,
            p.priority_name,
            s.status_name,
            c.category_name
        FROM INCIDENT i
        JOIN USER u ON i.user_id = u.user_id
        JOIN PRIORITY p ON i.priority_id = p.priority_id
        JOIN INCIDENT_STATUS s ON i.status_id = s.status_id
        JOIN INCIDENT_CATEGORY c ON i.category_id = c.category_id
        WHERE i.incident_id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to fetch incident"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Incident not found"
            });
        }

        res.status(200).json({
            incident: results[0]
        });
    });
};



const updateIncident = (req, res) => {
    const { id } = req.params;

    const {
        subject,
        description,
        priority_id,
        status_id
    } = req.body;

    const sql = `
        UPDATE INCIDENT
        SET
            subject = ?,
            description = ?,
            priority_id = ?,
            status_id = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE incident_id = ?
    `;

    const values = [
        subject,
        description,
        priority_id,
        status_id,
        id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to update incident"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Incident not found"
            });
        }

        res.status(200).json({
            message: "Incident updated successfully"
        });
    });
};


const deleteIncident = (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM INCIDENT
        WHERE incident_id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to delete incident"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Incident not found"
            });
        }

        res.status(200).json({
            message: "Incident deleted successfully"
        });
    });
};



const assignTechnician = (req, res) => {
    const { id } = req.params;
    const { technician_id } = req.body;

    // Check whether the technician exists and is active
    const checkSql = `
        SELECT technician_id
        FROM TECHNICIAN
        WHERE technician_id = ?
        AND availability_status = 'Available'
    `;

    db.query(checkSql, [technician_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Error checking technician"
            });
        }

        if (results.length === 0) {
            return res.status(400).json({
                message: "Technician not found or not available"
            });
        }

        // Assign technician to incident
        const updateSql = `
            UPDATE INCIDENT
            SET assigned_technician_id = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE incident_id = ?
        `;

        db.query(updateSql, [technician_id, id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Failed to assign technician"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Incident not found"
                });
            }

            res.status(200).json({
                message: "Technician assigned successfully",
                incident_id: id,
                technician_id: technician_id
            });
        });
    });
};



const getIncidentHistory = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            h.history_id,
            h.incident_id,
            old_status.status_name AS old_status,
            new_status.status_name AS new_status,
            changed_user.name AS changed_by,
            old_tech_user.name AS old_technician,
            new_tech_user.name AS new_technician,
            h.remarks,
            h.changed_at
        FROM INCIDENT_HISTORY h

        LEFT JOIN INCIDENT_STATUS old_status
            ON h.old_status_id = old_status.status_id

        JOIN INCIDENT_STATUS new_status
            ON h.new_status_id = new_status.status_id

        JOIN USER changed_user
            ON h.changed_by = changed_user.user_id

        LEFT JOIN TECHNICIAN old_tech
            ON h.old_technician_id = old_tech.technician_id

        LEFT JOIN USER old_tech_user
            ON old_tech.user_id = old_tech_user.user_id

        LEFT JOIN TECHNICIAN new_tech
            ON h.new_technician_id = new_tech.technician_id

        LEFT JOIN USER new_tech_user
            ON new_tech.user_id = new_tech_user.user_id

        WHERE h.incident_id = ?
        ORDER BY h.changed_at DESC
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch incident history"
            });
        }

        res.status(200).json({
            incident_id: id,
            total: results.length,
            history: results
        });
    });
};



const resolveIncident = (req, res) => {
    const { id } = req.params;
    const { technician_id, resolution_details } = req.body;

    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({
                message: "Could not start transaction"
            });
        }

        const updateSql = `
            UPDATE INCIDENT
            SET status_id = (
                SELECT status_id
                FROM INCIDENT_STATUS
                WHERE status_name = 'Resolved'
            ),
            updated_at = CURRENT_TIMESTAMP
            WHERE incident_id = ?
        `;

        db.query(updateSql, [id], (err, result) => {
            if (err || result.affectedRows === 0) {
                return db.rollback(() => {
                    res.status(err ? 500 : 404).json({
                        message: err
                            ? "Failed to update incident"
                            : "Incident not found"
                    });
                });
            }

            const insertSql = `
                INSERT INTO RESOLUTION
                (incident_id, technician_id, resolution_details, resolved_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            `;

            db.query(
                insertSql,
                [id, technician_id, resolution_details],
                (err, resolutionResult) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error(err);
                            res.status(500).json({
                                message: "Failed to save resolution"
                            });
                        });
                    }

                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                res.status(500).json({
                                    message: "Failed to commit resolution"
                                });
                            });
                        }

                        res.status(200).json({
                            message: "Incident resolved successfully",
                            incident_id: id,
                            resolution_id: resolutionResult.insertId
                        });
                    });
                }
            );
        });
    });
};


module.exports = {
    getAllIncidents,
    createIncident,
    getIncidentById,
    updateIncident,
    deleteIncident,
    assignTechnician,
    getIncidentHistory,
    resolveIncident
};