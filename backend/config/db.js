const fs = require("fs");
const path = require("path");


require("dotenv").config();

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
   
port: Number(process.env.DB_PORT),

// Enable secure connection for TiDB Cloud
...(process.env.DB_SSL === "true"
    ? {
        ssl: {
            ca: fs.readFileSync(
                path.join(__dirname, "../certs/isrgrootx1.pem")
            ),
            minVersion: "TLSv1.2",
            rejectUnauthorized: true
        }
    }
    : {}),


waitForConnections: true,

    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;