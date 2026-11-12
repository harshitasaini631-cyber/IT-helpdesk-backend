
const express = require("express");
const cors = require("cors");
const incidentRouter = require("./routes/incident.routes");
const technicianRouter = require("./routes/technician.routes");
const slaRouter = require("./routes/sla.routes");
const feedbackRouter = require("./routes/feedback.routes");
const assetRouter = require("./routes/asset.routes");
const serviceRouter = require("./routes/service.routes");
const problemRouter = require("./routes/problem.routes");
const escalationRouter = require("./routes/escalation.routes");
const authRouter = require("./routes/auth.routes");
const incidentActivityRouter = require("./routes/incidentActivity.routes");
const connectMongoDB = require("./config/mongo");
require("dotenv").config();

const db = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/incidents", incidentRouter);
app.use("/api/technicians", technicianRouter);
app.use("/api/sla", slaRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/assets", assetRouter);
app.use("/api/services", serviceRouter);
app.use("/api/problems", problemRouter);
app.use("/api/escalations", escalationRouter);
app.use("/api/auth", authRouter);
app.use("/api/activities", incidentActivityRouter);
connectMongoDB();

app.get("/", (req, res) => {
    res.send("IT Helpdesk API is running!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
