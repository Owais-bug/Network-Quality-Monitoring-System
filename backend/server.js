
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const errorHandler = require("./middlewares/errorMiddleware");
const dashboardRoutes = require("./routes/dashboardRoutes");
const targetRoutes = require("./routes/targetRoutes");
const eventRoutes = require("./routes/eventRoutes");
const reportRoutes = require("./routes/reportRoutes");
const {
    startMonitoringScheduler
} = require("./scheduler/monitoringScheduler");

const app = express();

const PORT = 5000;

// Middleware
// Middleware
app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

// API Routes
app.use("/api/targets", targetRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/dashboard", dashboardRoutes);
 app.use("/api/reports", reportRoutes);

// Root Route
app.get("/", (req, res) => {
    res.send("Network Quality Monitoring Backend is running!");
});

// Health API
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Network Monitoring API is Healthy"
    });
});

// Central Error Handler
app.use(errorHandler);

// Database Connection Test
async function testDatabaseConnection() {
    try {
        const [rows] = await pool.query("SELECT 1 AS result");
        const [tables] = await pool.query("SHOW TABLES");

        console.log("Database Tables:", tables);
        console.log("MySQL Connected Successfully!");
        console.log("Database Test Result:", rows[0].result);

    } catch (error) {
        console.error("MySQL Connection Failed:", error.message);
    }
}


/* Local Development Only */
if (process.env.VERCEL !== "1") {
    testDatabaseConnection();

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);

        startMonitoringScheduler();
    });
}

/* Export Express App for Vercel */
module.exports = app;
