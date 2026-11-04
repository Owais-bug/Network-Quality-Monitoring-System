
const pool = require("../config/db");

const saveCheckResult = async (result) => {
    const [dbResult] = await pool.query(
        `INSERT INTO check_results
        (target_id, checked_at, success,
         http_status_code, response_time_ms, error_message)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            result.target_id,
            new Date(result.checked_at),
            result.success,
            result.http_status_code,
            result.response_time_ms,
            result.error_message
        ]
    );

    return dbResult.insertId;
};


const getTargetHistory = async (targetId, limit = 50) => {
    const [rows] = await pool.query(
        `SELECT
            id,
            target_id,
            checked_at,
            success,
            http_status_code,
            response_time_ms,
            error_message
         FROM check_results
         WHERE target_id = ?
         ORDER BY checked_at DESC, id DESC
         LIMIT ?`,
        [targetId, limit]
    );

    return rows;
};


module.exports = { saveCheckResult ,   getTargetHistory };
