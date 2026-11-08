
const pool = require("../config/db");

const getReportChecks = async (
  targetId = null,
  fromDate = null,
  toDate = null,
  limit = 1000
) => {
  let query = `
    SELECT
      cr.id,
      cr.target_id,
      t.name AS target_name,
      t.url,
      cr.checked_at,
      cr.success,
      cr.http_status_code,
      cr.response_time_ms,
      cr.error_message
    FROM check_results cr
    JOIN targets t ON cr.target_id = t.id
    WHERE 1 = 1
  `;

  const params = [];

  if (targetId !== null) {
    query += " AND cr.target_id = ?";
    params.push(targetId);
  }

  if (fromDate !== null) {
    query += " AND cr.checked_at >= ?";
    params.push(fromDate);
  }

  if (toDate !== null) {
    query +=
      " AND cr.checked_at < DATE_ADD(?, INTERVAL 1 DAY)";
    params.push(toDate);
  }

  query += `
    ORDER BY cr.checked_at DESC, cr.id DESC
    LIMIT ?
  `;

  params.push(limit);

  const [rows] = await pool.query(query, params);

  return rows.reverse();
};

module.exports = { getReportChecks };
