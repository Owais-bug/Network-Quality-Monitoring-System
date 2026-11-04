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


const getAllEvents = async (
  severity = null,
  resolved = null,
  limit = 50
) => {
  let query = `
    SELECT
      e.id,
      e.target_id,
      t.name AS target_name,
      e.event_type,
      e.severity,
      e.message,
      e.created_at,
      e.resolved_at
    FROM events e
    JOIN targets t ON e.target_id = t.id
    WHERE 1 = 1
  `;

  const params = [];

  if (severity !== null) {
    query += " AND e.severity = ?";
    params.push(severity);
  }

  if (resolved !== null) {
    query += resolved
      ? " AND e.resolved_at IS NOT NULL"
      : " AND e.resolved_at IS NULL";
  }

  query += " ORDER BY e.created_at DESC, e.id DESC LIMIT ?";
  params.push(limit);

  const [rows] = await db.query(query, params);

  return rows;
};


module.exports = {
  createEvent,
  findActiveEvent,
  resolveEvent,
  getAllEvents
};