const mongoose = require("mongoose");

const incidentActivitySchema = new mongoose.Schema({
    incident_id: {
        type: Number,
        required: true
    },
    ticket_number: {
        type: String,
        required: true
    },
    activity_type: {
        type: String,
        required: true
    },
    performed_by: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const IncidentActivity = mongoose.model(
    "IncidentActivity",
    incidentActivitySchema,
    "incident_activities"
);
module.exports = IncidentActivity;