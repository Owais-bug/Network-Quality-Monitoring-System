
function TargetTable({
  targets = [],
  onToggle,
  onDelete,
  onEdit,
  onViewDetails
}) {
  return (
    <div className="target-table-container monitors-responsive-table">

      <table className="targets-table">

        <thead>
          <tr>
            <th>Website</th>
            <th>URL</th>
            <th>Status</th>
            <th>Response Time</th>
            <th>Last Check</th>
            <th>Monitoring</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {targets.map((target) => (
            <tr key={target.id}>

              {/* Website Name */}
              <td data-label="Website">
                {target.name}
              </td>

              {/* Website URL */}
              <td data-label="URL">
                {target.url}
              </td>

              {/* Current Status */}
              <td data-label="Status">
                <span
                  className={`target-status target-status--${(
                    target.current_status || "UNKNOWN"
                  ).toLowerCase()}`}
                >
                  {target.current_status || "UNKNOWN"}
                </span>
              </td>

              {/* Response Time */}
              <td data-label="Response Time">
                {target.latest_response_time_ms == null
                  ? "—"
                  : `${target.latest_response_time_ms} ms`}
              </td>

              {/* Last Check */}
              <td data-label="Last Check">
                {target.last_checked_at
                  ? new Date(
                      target.last_checked_at
                    ).toLocaleString()
                  : "Never checked"}
              </td>

              {/* Monitoring Status */}
              <td data-label="Monitoring">
                {target.enabled === 1
                  ? "Enabled"
                  : "Disabled"}
              </td>

              {/* Action Buttons */}
              <td data-label="Actions">

                <button
                  type="button"
                  onClick={() => onViewDetails(target.id)}
                >
                  View Details
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onToggle(target.id, target.enabled)
                  }
                >
                  {target.enabled === 1
                    ? "Disable"
                    : "Enable"}
                </button>

                <button
                  type="button"
                  onClick={() => onEdit(target)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onDelete(target.id, target.name)
                  }
                >
                  Delete
                </button>

              </td>

            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}

export default TargetTable;
