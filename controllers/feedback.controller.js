
const db = require("../config/db");

const createFeedback = (req, res) => {
    const { incident_id, rating, comments } = req.body;

    const user_id = req.user.user_id;
    // Check whether the incident is resolved
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
            console.error(err);
            return res.status(500).json({
                message: "Failed to verify incident"
            });
        }

        if (results.length === 0) {
            return res.status(400).json({
                message: "Incident not found, not resolved, or does not belong to this user"
            });
        }

        // Insert feedback
        const insertSql = `
            INSERT INTO FEEDBACK
            (incident_id, user_id, rating, comments, submitted_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;

        db.query(
            insertSql,
            [incident_id, user_id, rating, comments],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        message: "Failed to submit feedback"
                    });
                }

                res.status(201).json({
                    message: "Feedback submitted successfully",
                    feedback_id: result.insertId
                });
            }
        );
    });
};

module.exports = { createFeedback };
