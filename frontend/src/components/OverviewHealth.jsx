
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
     
{/* Monitoring Snapshot — Design B */}
<div className="overview-health-card overview-snapshot-card">

  <div className="snapshot-header">
    <span className="snapshot-heading-icon">◉</span>
    <h3>Monitoring Snapshot</h3>
  </div>

  <div className="snapshot-metrics">

    <div className="snapshot-metric">
      <span>TRACKED WEBSITES</span>
      <strong>{total}</strong>
    </div>

    <div className="snapshot-metric">
      <span>OPEN EVENTS</span>

      <div className="snapshot-event-value">
        <strong>{events}</strong>
        <span
          className={`snapshot-status-dot ${
            events > 0 ? "has-events" : "no-events"
          }`}
          aria-label={
            events > 0 ? "Open events present" : "No open events"
          }
        />
      </div>
    </div>

  </div>

  <div className="snapshot-footer">
    <span>Automatic refresh enabled</span>

    <div className="snapshot-refresh">
      <span className="snapshot-refresh-icon">↻</span>
      <span>Every 60s</span>
    </div>
  </div>

</div>


    </div>
  );
}

export default OverviewHealth;

