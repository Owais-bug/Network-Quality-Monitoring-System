const db = require("../config/db");

const createEvent = async (
  targetId,
  eventType,
  severity,
  message
) => {
  const [result] = await db.query(
    `INSERT INTO events
     (target_id, event_type, severity, message)
     VALUES (?, ?, ?, ?)`,
    [targetId, eventType, severity, message]
  );

  return result.insertId;
};

const findActiveEvent = async (targetId) => {
  const [rows] = await db.query(
    `SELECT *
     FROM events
     WHERE target_id = ?
       AND resolved_at IS NULL
     ORDER BY created_at DESC, id DESC
     LIMIT 1`,
    [targetId]
  );

  return rows[0] || null;
};

const resolveEvent = async (eventId) => {
  const [result] = await db.query(
    `UPDATE events
     SET resolved_at = NOW()
     WHERE id = ?
       AND resolved_at IS NULL`,
    [eventId]
  );

  return result.affectedRows;
};

module.exports = { createEvent , findActiveEvent ,  resolveEvent};