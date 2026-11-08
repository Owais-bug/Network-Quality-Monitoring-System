
const { getReportChecks } = require("../models/reportModel");

// Validate YYYY-MM-DD date
const isValidDate = (value) => {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
};

// Escape values for safe CSV output
const escapeCsv = (value) => {
  if (value === null || value === undefined) {
    return '""';
  }

  let text = String(value);

  // Prevent spreadsheet formula injection
  if (/^\s*[=+\-@]/.test(text)) {
    text = "'" + text;
  }

  return `"${text.replace(/"/g, '""')}"`;
};

// GET /api/reports/checks.csv
const exportChecksCsv = async (req, res, next) => {
  try {
    const {
      targetId: targetIdParam,
      fromDate = null,
      toDate = null,
      limit: limitParam
    } = req.query;

    const targetId =
      targetIdParam === undefined
        ? null
        : Number(targetIdParam);

    const limit =
      limitParam === undefined
        ? 1000
        : Number(limitParam);

    // Validate target ID
    if (
      targetId !== null &&
      (!Number.isSafeInteger(targetId) || targetId <= 0)
    ) {
      return res.status(400).json({
        message: "Invalid target ID"
      });
    }

    // Validate limit
    if (
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > 1000
    ) {
      return res.status(400).json({
        message: "Limit must be between 1 and 1000"
      });
    }

    // Validate dates
    if (
      (fromDate !== null && !isValidDate(fromDate)) ||
      (toDate !== null && !isValidDate(toDate))
    ) {
      return res.status(400).json({
        message: "Dates must use valid YYYY-MM-DD format"
      });
    }

    if (fromDate && toDate && fromDate > toDate) {
      return res.status(400).json({
        message: "From Date cannot be after To Date"
      });
    }

    // Fetch real monitoring records from MySQL
    const checks = await getReportChecks(
      targetId,
      fromDate,
      toDate,
      limit
    );

    // CSV column headings
    const headers = [
      "Check ID",
      "Target ID",
      "Website",
      "URL",
      "Checked At",
      "Success",
      "HTTP Status",
      "Response Time (ms)",
      "Error Message"
    ];

    // Convert database rows into CSV rows
    const rows = checks.map((check) => [
      check.id,
      check.target_id,
      check.target_name,
      check.url,
      check.checked_at instanceof Date
        ? check.checked_at.toISOString()
        : check.checked_at,
      check.success,
      check.http_status_code,
      check.response_time_ms,
      check.error_message
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    // Send CSV as downloadable file
    res.setHeader(
      "Content-Type",
      "text/csv; charset=utf-8"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="monitoring-checks.csv"'
    );

    return res.status(200).send("\uFEFF" + csv);

  } catch (error) {
    next(error);
  }
};

module.exports = { exportChecksCsv };
