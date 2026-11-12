
const db = require("../config/db");


const createFeedback = (req, res) => {
    const { incident_id, rating, comments } = req.body;
    const user_id = req.user.user_id;

    // Validate required fields
    if (!incident_id || rating === undefined || rating === null) {
        return res.status(400).json({
            message: "Incident ID and rating are required"
        });
    }

    // Rating must be an integer between 1 and 5
    if (!Number.isInteger(Number(rating)) ||
        Number(rating) < 1 ||
        Number(rating) > 5) {
        return res.status(400).json({
            message: "Rating must be an integer between 1 and 5"
        });
    }

    const checkSql = `
        SELECT incident_id
        FROM INCIDENT i
        JOIN INCIDENT_STATUS s
            ON i.status_id = s.status_id
        WHERE i.incident_id = ?
          AND i.user_id = ?
          AND s.status_name IN ('Resolved', 'Closed')
    `;

    db.query(checkSql, [incident_id, user_id], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to verify incident"
            });
        }

        if (results.length === 0) {
            return res.status(400).json({
                message: "Incident not found, not resolved, or does not belong to this user"
            });
        }

        const insertSql = `
            INSERT INTO FEEDBACK
            (incident_id, user_id, rating, comments, submitted_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;

        db.query(
            insertSql,
            [incident_id, user_id, Number(rating), comments || null],
            (err, result) => {
                if (err) {
                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            message: "Feedback has already been submitted for this incident"
                        });
                    }

                    console.error(err);
                    return res.status(500).json({
                        message: "Failed to submit feedback"
                    });
                }

                return res.status(201).json({
                    message: "Feedback submitted successfully",
                    feedback_id: result.insertId
                });
            }
        );
    });
};


module.exports = { createFeedback };
