
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const pool = require("./config/db");
const errorHandler = require("./middlewares/errorMiddleware");

const dashboardRoutes = require("./routes/dashboardRoutes");
const targetRoutes = require("./routes/targetRoutes");
const eventRoutes = require("./routes/eventRoutes");
const reportRoutes = require("./routes/reportRoutes");

const {
    startMonitoringScheduler,
    runDueChecks
} = require("./scheduler/monitoringScheduler");

const app = express();

const PORT = 5000;

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

// ========================================
// API ROUTES
// ========================================

app.use("/api/targets", targetRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

// ========================================
// ROOT ROUTE
// ========================================

app.get("/", (req, res) => {
    res.send("Network Quality Monitoring Backend is running!");
});

// ========================================
// HEALTH API
// ========================================

app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Network Monitoring API is Healthy"
    });
});

// ========================================
// SECURE AUTOMATIC MONITORING ENDPOINT
// Used by cron-job.org
// ========================================

app.post("/api/internal/monitor/run", async (req, res, next) => {
    try {
        const expectedSecret = process.env.MONITOR_CRON_SECRET;
        const providedSecret = req.get("x-monitor-secret") || "";

        // Secret must be configured on the server
        if (!expectedSecret) {
            return res.status(503).json({
                message: "Monitoring endpoint not configured"
            });
        }

        const expectedBuffer = Buffer.from(expectedSecret);
        const providedBuffer = Buffer.from(providedSecret);

        // Compare secret securely
        const validSecret =
            expectedBuffer.length === providedBuffer.length &&
            crypto.timingSafeEqual(
                expectedBuffer,
                providedBuffer
            );

        if (!validSecret) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Run monitoring checks
        const result = await runDueChecks();

        return res.status(200).json(result);

    } catch (error) {
        next(error);
    }
});

// ========================================
// CENTRAL ERROR HANDLER
// ========================================

app.use(errorHandler);

// ========================================
// DATABASE CONNECTION TEST
// ========================================

async function testDatabaseConnection() {
    try {
        const [rows] = await pool.query("SELECT 1 AS result");
        const [tables] = await pool.query("SHOW TABLES");

        console.log("Database Tables:", tables);
        console.log("MySQL Connected Successfully!");
        console.log("Database Test Result:", rows[0].result);

    } catch (error) {
        console.error(
            "MySQL Connection Failed:",
            error.message
        );
    }
}

// ========================================
// LOCAL DEVELOPMENT ONLY
// ========================================

if (process.env.VERCEL !== "1") {

    testDatabaseConnection();

    app.listen(PORT, () => {
        console.log(
            `Server running on http://localhost:${PORT}`
        );

        startMonitoringScheduler();
    });
}

// ========================================
// EXPORT EXPRESS APP FOR VERCEL
// ========================================

module.exports = app;
