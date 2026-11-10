
const db = require("../config/db");

// Get all services
const getAllServices = (req, res) => {
    const sql = `
        SELECT
            s.*,
            st.team_name
        FROM SERVICE s
        LEFT JOIN SUPPORT_TEAM st
            ON s.team_id = st.team_id
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch services"
            });
        }

        res.status(200).json({
            total: results.length,
            services: results
        });
    });
};



const getServiceById = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            s.*,
            st.team_name
        FROM SERVICE s
        LEFT JOIN SUPPORT_TEAM st
            ON s.team_id = st.team_id
        WHERE s.service_id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch service"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.status(200).json(results[0]);
    });
};



const createService = (req, res) => {
    const {
        service_name,
        description,
        team_id,
        service_status
    } = req.body;

    const sql = `
        INSERT INTO SERVICE
        (service_name, description, team_id, service_status)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            service_name,
            description || null,
            team_id || null,
            service_status || null
        ],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Failed to create service"
                });
            }

            res.status(201).json({
                message: "Service created successfully",
                service_id: result.insertId
            });
        }
    );
};


const updateService = (req, res) => {
    const { id } = req.params;

    const {
        service_name,
        description,
        team_id,
        service_status
    } = req.body;

    const sql = `
        UPDATE SERVICE
        SET
            service_name = ?,
            description = ?,
            team_id = ?,
            service_status = ?
        WHERE service_id = ?
    `;

    const values = [
        service_name,
        description || null,
        team_id || null,
        service_status || null,
        id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to update service"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.status(200).json({
            message: "Service updated successfully"
        });
    });
};


const deleteService = (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM SERVICE
        WHERE service_id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to delete service"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.status(200).json({
            message: "Service deleted successfully"
        });
    });
};

module.exports = {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService
};