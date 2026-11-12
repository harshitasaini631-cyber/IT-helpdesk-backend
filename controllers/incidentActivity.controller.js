const IncidentActivity = require("../models/IncidentActivity");

const createActivity = async (req, res) => {
    try {
        const {
            incident_id,
            ticket_number,
            activity_type,
            performed_by,
            description,
            metadata
        } = req.body;

        if (
            !incident_id ||
            !ticket_number ||
            !activity_type ||
            !performed_by ||
            !description
        ) {
            return res.status(400).json({
                message: "All required fields must be provided"
            });
        }

        const activity = await IncidentActivity.create({
            incident_id,
            ticket_number,
            activity_type,
            performed_by,
            description,
            metadata
        });

        res.status(201).json({
            message: "Activity created successfully",
            activity
        });

    } catch (error) {
        console.error("Create activity error:", error);

        res.status(500).json({
            message: "Server error while creating activity"
        });
    }
};

const getAllActivities = async (req, res) => {
    try {
        const activities = await IncidentActivity.find().sort({
            created_at: -1
        });

        res.status(200).json({
            count: activities.length,
            activities
        });

    } catch (error) {
        console.error("Get activities error:", error);

        res.status(500).json({
            message: "Server error while fetching activities"
        });
    }
};

const getActivitiesByIncident = async (req, res) => {
    try {
        const { incident_id } = req.params;

        const activities = await IncidentActivity.find({
            incident_id: Number(incident_id)
        }).sort({ created_at: -1 });

        res.status(200).json({
            count: activities.length,
            activities
        });

    } catch (error) {
        console.error("Get incident activities error:", error);

        res.status(500).json({
            message: "Server error while fetching incident activities"
        });
    }
};

const updateActivity = async (req, res) => {
    try {
        const { id } = req.params;

        const activity = await IncidentActivity.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!activity) {
            return res.status(404).json({
                message: "Activity not found"
            });
        }

        res.status(200).json({
            message: "Activity updated successfully",
            activity
        });

    } catch (error) {
        console.error("Update activity error:", error);

        res.status(500).json({
            message: "Server error while updating activity"
        });
    }
};

const deleteActivity = async (req, res) => {
    try {
        const { id } = req.params;

        const activity = await IncidentActivity.findByIdAndDelete(id);

        if (!activity) {
            return res.status(404).json({
                message: "Activity not found"
            });
        }

        res.status(200).json({
            message: "Activity deleted successfully"
        });

    } catch (error) {
        console.error("Delete activity error:", error);

        res.status(500).json({
            message: "Server error while deleting activity"
        });
    }
};

module.exports = {
    createActivity,
    getAllActivities,
    getActivitiesByIncident,
    updateActivity,
    deleteActivity
};