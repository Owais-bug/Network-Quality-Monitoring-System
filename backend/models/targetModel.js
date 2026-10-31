const pool = require("../config/db");

const getAllTargets = async () => {
    const [rows] = await pool.query(
        "SELECT * FROM targets"
    );

    return rows;
};

const createTarget = async (name, host, url, interval_seconds, threshold_ms) => {

    const [result] = await pool.query(
        `INSERT INTO targets
        (name, host, url, interval_seconds, threshold_ms)
        VALUES (?, ?, ?, ?, ?)`,
        [name, host, url, interval_seconds, threshold_ms]
    );

    return result.insertId;
};

module.exports = { getAllTargets , createTarget};