
function OverviewHealth({ summary }) {
  const total = summary?.totalTargets ?? 0;
  const up = summary?.upTargets ?? 0;
  const slow = summary?.slowTargets ?? 0;
  const down = summary?.downTargets ?? 0;
  const events = summary?.activeEvents ?? 0;

  const unknown = Math.max(
    0,
    total - up - slow - down
  );

  const percentage = (value) =>
    total > 0 ? `${(value / total) * 100}%` : "0%";

  return (
    <div className="overview-health-grid">

      {/* Monitor Distribution */}
      <div className="overview-health-card">
        <h3>Current Monitor Distribution</h3>

        <h2>
          {up} <span>of {total} UP</span>
        </h2>

        <div className="health-progress">
          <span
            className="health-up"
            style={{ width: percentage(up) }}
          />
          <span
            className="health-slow"
            style={{ width: percentage(slow) }}
          />
          <span
            className="health-down"
            style={{ width: percentage(down) }}
          />
          <span
            className="health-unknown"
            style={{ width: percentage(unknown) }}
          />
        </div>

        <p>
          {up} UP · {slow} SLOW · {down} DOWN
          {unknown > 0 ? ` · ${unknown} UNKNOWN` : ""}
        </p>

        <small>Based on last recorded statuses.</small>
      </div>

      {/* Monitoring Snapshot */}
      <div className="overview-health-card">
        <h3>Monitoring Snapshot</h3>

        <p>Tracked Websites: <strong>{total}</strong></p>
        <p>Open Events: <strong>{events}</strong></p>
        <p>Auto-Refresh: <strong>60 seconds</strong></p>
      </div>

    </div>
  );
}

export default OverviewHealth;

