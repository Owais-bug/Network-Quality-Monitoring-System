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

const getTargetById = async (id) => {
    const [rows] = await pool.query(
        "SELECT * FROM targets WHERE id = ?",
        [id]
    );

    return rows[0];
};

const updateTarget = async (id, name, host, url, interval_seconds, threshold_ms) => {
    const [result] = await pool.query(
        `UPDATE targets
         SET name = ?, host = ?, url = ?,
             interval_seconds = ?, threshold_ms = ?
         WHERE id = ?`,
        [name, host, url, interval_seconds, threshold_ms, id]
    );

    return result.affectedRows;
};

const setTargetEnabled = async (id, enabled) => {
    const [result] = await pool.query(
        "UPDATE targets SET enabled = ? WHERE id = ?",
        [enabled, id]
    );

    return result.affectedRows;
};

const deleteTarget = async (id) => {
    const [result] = await pool.query(
        "DELETE FROM targets WHERE id = ?",
        [id]
    );

    return result.affectedRows;
};


const getOneEnabledTarget = async () => {
    const [rows] = await pool.query(
        `SELECT * FROM targets
         WHERE enabled = 1
         ORDER BY id ASC
         LIMIT 1`
    );

    return rows[0] || null;
};

const updateTargetStatus = async (id, status, checkedAt) => {

    const [result] = await pool.query(
        `UPDATE targets
         SET current_status = ?,
             last_checked_at = ?
         WHERE id = ?`,
        [status, new Date(checkedAt), id]
    );

    return result.affectedRows;
};

module.exports = {
    getAllTargets,
    createTarget,
    getTargetById,
    updateTarget,
    setTargetEnabled,
    deleteTarget,
    getOneEnabledTarget,
     updateTargetStatus
};