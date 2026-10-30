
const express = require("express");
const pool = require("./config/db");
const errorHandler = require("./middlewares/errorMiddleware");
const app = express();
const PORT = 5000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Network Quality Monitoring Backend is running!");
});

app.get("/api/health" , (req,res)=>{
    res.status(200).json({
        status: "OK",
        message: "Network Monitoring API is Healthy"
    });
})



app.use(errorHandler);

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

testDatabaseConnection();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
