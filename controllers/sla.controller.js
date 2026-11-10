
const db = require("../config/db");

const getAllSLARecords = (req, res) => {

    const sql = `
        SELECT
            st.tracking_id,
            i.incident_id,
            i.ticket_number,
            i.subject,
            sla.sla_name,
            p.priority_name,
            s.status_name,
            st.response_due_at,
            st.resolution_due_at,
            st.first_response_at,
            st.resolved_at,
            st.response_breached,
            st.resolution_breached
        FROM SLA_TRACKING st

        JOIN INCIDENT i
            ON st.incident_id = i.incident_id

        JOIN SLA sla
            ON st.sla_id = sla.sla_id

        JOIN PRIORITY p
            ON i.priority_id = p.priority_id

        JOIN INCIDENT_STATUS s
            ON i.status_id = s.status_id

        ORDER BY st.resolution_due_at ASC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Error fetching SLA records:", err);

            return res.status(500).json({
                message: "Failed to fetch SLA records"
            });
        }

        res.status(200).json({
            message: "SLA records fetched successfully",
            total: results.length,
            sla_records: results
        });
    });
};




const getOverdueIncidents = (req, res) => {

    const sql = `
        SELECT
            i.incident_id,
            i.ticket_number,
            i.subject,
            p.priority_name,
            s.status_name,
            st.resolution_due_at,
            CASE
                WHEN st.resolution_due_at < NOW()
                THEN 'Overdue'
                ELSE 'Within Deadline'
            END AS sla_status
        FROM SLA_TRACKING st
        JOIN INCIDENT i
            ON st.incident_id = i.incident_id
        JOIN PRIORITY p
            ON i.priority_id = p.priority_id
        JOIN INCIDENT_STATUS s
            ON i.status_id = s.status_id
        WHERE st.resolution_due_at < NOW()
          AND s.status_name NOT IN ('Resolved', 'Closed')
        ORDER BY st.resolution_due_at ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch overdue incidents"
            });
        }

        res.status(200).json({
            message: "Overdue incidents fetched successfully",
            total: results.length,
            overdue_incidents: results
        });
    });
};

module.exports = {
    getAllSLARecords,
    getOverdueIncidents
};