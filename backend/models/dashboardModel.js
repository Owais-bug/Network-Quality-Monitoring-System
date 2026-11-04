
const pool = require("../config/db");

const getDashboardSummary = async () => {
    const [rows] = await pool.query(`
        SELECT
            COUNT(*) AS totalTargets,
            SUM(CASE WHEN current_status = 'UP' THEN 1 ELSE 0 END) AS upTargets,
            SUM(CASE WHEN current_status = 'SLOW' THEN 1 ELSE 0 END) AS slowTargets,
            SUM(CASE WHEN current_status = 'DOWN' THEN 1 ELSE 0 END) AS downTargets,
            SUM(CASE WHEN current_status = 'UNKNOWN' THEN 1 ELSE 0 END) AS unknownTargets
        FROM targets
    `);

    const [eventRows] = await pool.query(`
        SELECT COUNT(*) AS activeEvents
        FROM events
        WHERE resolved_at IS NULL
    `);

    return {
        totalTargets: Number(rows[0].totalTargets),
        upTargets: Number(rows[0].upTargets),
        slowTargets: Number(rows[0].slowTargets),
        downTargets: Number(rows[0].downTargets),
        unknownTargets: Number(rows[0].unknownTargets),
        activeEvents: Number(eventRows[0].activeEvents)
    };
};

module.exports = {
    getDashboardSummary
};
