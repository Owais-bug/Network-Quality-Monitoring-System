
function TargetTable({ targets = [], onToggle, onDelete, onEdit, onViewDetails }) {
    return (
        <div className="target-table-container">
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
      <td>{target.name}</td>

      <td>{target.url}</td>

      <td>
        <span
          className={`target-status target-status--${(
            target.current_status || "UNKNOWN"
          ).toLowerCase()}`}
        >
          {target.current_status || "UNKNOWN"}
        </span>
      </td>

      <td>
        {target.latest_response_time_ms == null
          ? "—"
          : `${target.latest_response_time_ms} ms`}
      </td>

      <td>
        {target.last_checked_at
          ? new Date(target.last_checked_at).toLocaleString()
          : "Never checked"}
      </td>

      <td>
        {target.enabled === 1 ? "Enabled" : "Disabled"}
      </td>

      <td>
        <button
          type="button"
          onClick={() => onViewDetails(target.id)}
        >
          View Details
        </button>

        <button
          type="button"
          onClick={() => onToggle(target.id, target.enabled)}
        >
          {target.enabled === 1 ? "Disable" : "Enable"}
        </button>

        <button
          type="button"
          onClick={() => onEdit(target)}
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(target.id, target.name)}
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
