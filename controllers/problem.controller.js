
const db = require("../config/db");

// Get all problems
const getAllProblems = (req, res) => {
    const sql = `
        SELECT *
        FROM PROBLEM
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch problems"
            });
        }

        res.status(200).json({
            total: results.length,
            problems: results
        });
    });
};


const getProblemById = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT *
        FROM PROBLEM
        WHERE problem_id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch problem"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Problem not found"
            });
        }

        res.status(200).json(results[0]);
    });
};



const createProblem = (req, res) => {
    const {
        problem_title,
        description,
        root_cause,
        problem_status
    } = req.body;

    if (!problem_title || !problem_title.trim()) {
        return res.status(400).json({
            message: "Problem title is required"
        });
    }

    const sql = `
        INSERT INTO PROBLEM
        (
            problem_title,
            description,
            root_cause,
            problem_status,
            created_at
        )
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    const values = [
        problem_title.trim(),
        description || null,
        root_cause || null,
        problem_status || "Open"
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to create problem"
            });
        }

        return res.status(201).json({
            message: "Problem created successfully",
            problem_id: result.insertId
        });
    });
};



const updateProblem = (req, res) => {
    const { id } = req.params;

    const {
        problem_title,
        description,
        root_cause,
        problem_status
    } = req.body;

    const sql = `
        UPDATE PROBLEM
        SET
            problem_title = ?,
            description = ?,
            root_cause = ?,
            problem_status = ?
        WHERE problem_id = ?
    `;

    const values = [
        problem_title,
        description || null,
        root_cause || null,
        problem_status,
        id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to update problem"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Problem not found or no changes made"
            });
        }

        res.status(200).json({
            message: "Problem updated successfully"
        });
    });
};


const deleteProblem = (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM PROBLEM
        WHERE problem_id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to delete problem"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Problem not found"
            });
        }

        res.status(200).json({
            message: "Problem deleted successfully"
        });
    });
};


module.exports = {
    getAllProblems,
    getProblemById,
    createProblem,
    updateProblem,
    deleteProblem
};