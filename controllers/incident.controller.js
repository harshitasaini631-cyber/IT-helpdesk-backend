
const db = require("../config/db");


const getAllIncidents = (req, res) => {

    let sql = `
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
    `;

    let params = [];

    // Employee: show only their own incidents
    if (req.user.role_id === 1) {
        sql += ` WHERE i.user_id = ?`;
        params.push(req.user.user_id);
    }

    // Technician: show only incidents assigned to them
    else if (req.user.role_id === 3) {
        sql += `
            JOIN TECHNICIAN t
                ON i.assigned_technician_id = t.technician_id
            WHERE t.user_id = ?
        `;
        params.push(req.user.user_id);
    }

    // Helpdesk Agent, IT Manager and Administrator:
    // show all incidents

    sql += ` ORDER BY i.created_at DESC`;

    db.query(sql, params, (err, results) => {

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
    const roleId = req.user.role_id;
    const userId = req.user.user_id;

    let sql = `
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
    `;

    const values = [id];

    if (roleId === 1) {
        // Employees can view only their own incidents
        sql += ` WHERE i.incident_id = ? AND i.user_id = ?`;
        values.push(userId);

    } else if (roleId === 3) {
        // Technicians can view only incidents assigned to them
        sql += `
            JOIN TECHNICIAN t
                ON i.assigned_technician_id = t.technician_id
            WHERE i.incident_id = ? AND t.user_id = ?
        `;
        values.push(userId);

    } else if ([2, 4, 5].includes(roleId)) {
        // Helpdesk Agents, IT Managers and Admins
        // can view all incidents
        sql += ` WHERE i.incident_id = ?`;

    } else {
        return res.status(403).json({
            message: "Access forbidden"
        });
    }

    db.query(sql, values, (err, results) => {
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

    let sql = `
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

    // Employee: can update only their own incidents
    if (req.user.role_id === 1) {
        sql += ` AND user_id = ?`;
        values.push(req.user.user_id);
    }

    // Other roles retain access for now.
    // We will apply more specific permissions to them later.

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
    const changedBy = req.user.user_id;

    db.getConnection((connectionErr, connection) => {
        if (connectionErr) {
            return res.status(500).json({
                message: "Database connection failed"
            });
        }

        const releaseConnection = () => connection.release();

        const checkSql = `
            SELECT technician_id
            FROM TECHNICIAN
            WHERE technician_id = ?
            AND availability_status = 'Available'
        `;

        connection.query(checkSql, [technician_id], (err, results) => {
            if (err) {
                releaseConnection();
                return res.status(500).json({ message: err.message });
            }

            if (results.length === 0) {
                releaseConnection();
                return res.status(400).json({
                    message: "Technician not found or not available"
                });
            }

            connection.query(
                "SET @changed_by = ?",
                [changedBy],
                (err) => {
                    if (err) {
                        releaseConnection();
                        return res.status(500).json({ message: err.message });
                    }

                    const updateSql = `
                        UPDATE INCIDENT
                        SET assigned_technician_id = ?,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE incident_id = ?
                    `;

                    connection.query(
                        updateSql,
                        [technician_id, id],
                        (err, result) => {
                            connection.query(
                                "SET @changed_by = NULL",
                                (resetErr) => {
                                    releaseConnection();

                                    if (err) {
                                        return res.status(500).json({
                                            message: err.message
                                        });
                                    }

                                    if (resetErr) {
                                        return res.status(500).json({
                                            message: resetErr.message
                                        });
                                    }

                                    if (result.affectedRows === 0) {
                                        return res.status(404).json({
                                            message: "Incident not found"
                                        });
                                    }

                                    return res.status(200).json({
                                        message: "Technician assigned successfully",
                                        incident_id: id,
                                        technician_id
                                    });
                                }
                            );
                        }
                    );
                }
            );
        });
    });
};




const getIncidentHistory = (req, res) => {
    const { id } = req.params;
    const roleId = req.user.role_id;
    const userId = req.user.user_id;

    let accessSql = "";
    let accessValues = [id];

    if (roleId === 1) {
        // Employees can view history of their own incidents
        accessSql = `
            SELECT incident_id
            FROM INCIDENT
            WHERE incident_id = ? AND user_id = ?
        `;
        accessValues.push(userId);

    } else if (roleId === 3) {
        // Technicians can view history of incidents assigned to them
        accessSql = `
            SELECT i.incident_id
            FROM INCIDENT i
            JOIN TECHNICIAN t
                ON i.assigned_technician_id = t.technician_id
            WHERE i.incident_id = ? AND t.user_id = ?
        `;
        accessValues.push(userId);

    } else if ([2, 4, 5].includes(roleId)) {
        // Helpdesk Agents, IT Managers and Admins
        accessSql = `
            SELECT incident_id
            FROM INCIDENT
            WHERE incident_id = ?
        `;

    } else {
        return res.status(403).json({
            message: "Access forbidden"
        });
    }

    db.query(accessSql, accessValues, (err, accessResults) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to verify incident access"
            });
        }

        if (accessResults.length === 0) {
            return res.status(404).json({
                message: "Incident not found"
            });
        }

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

            return res.status(200).json({
                incident_id: id,
                total: results.length,
                history: results
            });
        });
    });
};



const resolveIncident = (req, res) => {
    const { id } = req.params;
    const { resolution_details } = req.body;

    const roleId = req.user.role_id;
    const userId = req.user.user_id;

    if (!resolution_details || !resolution_details.trim()) {
        return res.status(400).json({
            message: "Resolution details are required"
        });
    }

    db.getConnection((connectionErr, connection) => {
        if (connectionErr) {
            return res.status(500).json({
                message: "Database connection failed"
            });
        }

        connection.beginTransaction((err) => {
            if (err) {
                connection.release();
                return res.status(500).json({
                    message: "Could not start transaction"
                });
            }

            const rollback = (status, message) => {
                connection.rollback(() => {
                    connection.release();
                    res.status(status).json({ message });
                });
            };

            const incidentSql = `
                SELECT
                    i.incident_id,
                    i.assigned_technician_id,
                    s.status_name
                FROM INCIDENT i
                JOIN INCIDENT_STATUS s
                    ON i.status_id = s.status_id
                WHERE i.incident_id = ?
                FOR UPDATE
            `;

            connection.query(incidentSql, [id], (err, results) => {
                if (err) {
                    return rollback(500, "Failed to fetch incident");
                }

                if (results.length === 0) {
                    return rollback(404, "Incident not found");
                }

                const incident = results[0];
                const technicianId = incident.assigned_technician_id;

                if (["Resolved", "Closed"].includes(incident.status_name)) {
                    return rollback(409, "Incident is already resolved or closed");
                }

                if (!technicianId) {
                    return rollback(400, "Assign a technician before resolving");
                }

                if (roleId === 3) {
                    const technicianSql = `
                        SELECT technician_id
                        FROM TECHNICIAN
                        WHERE user_id = ?
                    `;

                    connection.query(
                        technicianSql,
                        [userId],
                        (err, techResults) => {
                            if (err) {
                                return rollback(500, "Failed to verify technician");
                            }

                            if (
                                techResults.length === 0 ||
                                techResults[0].technician_id !== technicianId
                            ) {
                                return rollback(
                                    403,
                                    "You can only resolve incidents assigned to you"
                                );
                            }

                            saveResolution();
                        }
                    );
                } else {
                    saveResolution();
                }

                function saveResolution() {
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

                    connection.query(updateSql, [id], (err) => {
                        if (err) {
                            return rollback(500, "Failed to update incident");
                        }

                        const insertSql = `
                            INSERT INTO RESOLUTION
                            (
                                incident_id,
                                technician_id,
                                resolution_details,
                                resolved_at
                            )
                            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                        `;

                        connection.query(
                            insertSql,
                            [id, technicianId, resolution_details],
                            (err, result) => {
                                if (err) {
                                    console.error(err);
                                    return rollback(500, "Failed to save resolution");
                                }

                                connection.commit((err) => {
                                    if (err) {
                                        return rollback(
                                            500,
                                            "Failed to commit resolution"
                                        );
                                    }

                                    connection.release();

                                    return res.status(200).json({
                                        message: "Incident resolved successfully",
                                        incident_id: id,
                                        resolution_id: result.insertId
                                    });
                                });
                            }
                        );
                    });
                }
            });
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