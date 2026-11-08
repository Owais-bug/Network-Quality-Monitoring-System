
import { useEffect, useState } from "react";

function TargetDetails({ targetId, onBack }) {
  const [target, setTarget] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState("24H");

  const [availability, setAvailability] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState("");
  
useEffect(() => {
  const controller = new AbortController();

  const loadDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const [targetResponse, historyResponse] =
        await Promise.all([
          fetch(`/api/targets/${targetId}`, {
            signal: controller.signal,
          }),
          fetch(`/api/targets/${targetId}/history?limit=500`, {
            signal: controller.signal,
          }),
        ]);

      if (!targetResponse.ok || !historyResponse.ok) {
        throw new Error("Unable to load target details.");
      }

      const targetData = await targetResponse.json();
      const historyData = await historyResponse.json();

      if (!controller.signal.aborted) {
        setTarget(targetData);
        setHistory(historyData.history || []);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  };

  loadDetails();

  return () => controller.abort();
}, [targetId]);



  useEffect(() => {
    const controller = new AbortController();

    const loadAvailability = async () => {
      setAvailabilityLoading(true);
      setAvailabilityError("");
      setAvailability(null);

      try {
        const hours = {
          "1H": 1,
          "24H": 24,
          "7D": 168,
        }[range];

        const response = await fetch(
          `/api/targets/${targetId}/availability?hours=${hours}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to load availability.");
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setAvailability(data);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setAvailabilityError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setAvailabilityLoading(false);
        }
      }
    };

    loadAvailability();

    return () => controller.abort();
  }, [targetId, range]);


  if (loading) {
    return <p>Loading target details...</p>;
  }

  if (error) {
    return (
      <div role="alert">
        <p>{error}</p>
        <button onClick={onBack}>Back to Monitors</button>
      </div>
    );
  }

  if (!target) return null;

  const hours = {
    "1H": 1,
    "24H": 24,
    "7D": 168,
  };

  const cutoff =
    Date.now() - hours[range] * 60 * 60 * 1000;

  const filteredHistory = history.filter(
    (item) => new Date(item.checked_at).getTime() >= cutoff
  );

  const chartData = filteredHistory
    .filter(
      (item) =>
        item.response_time_ms != null &&
        Number.isFinite(Number(item.response_time_ms))
    )
    .sort(
      (a, b) =>
        new Date(a.checked_at) - new Date(b.checked_at)
    );

  const maxResponse = Math.max(
    1,
    ...chartData.map((item) => Number(item.response_time_ms))
  );

  const points = chartData.map((item, index) => {
    const x =
      chartData.length === 1
        ? 300
        : 20 + (index / (chartData.length - 1)) * 560;

    const y =
      145 - (Number(item.response_time_ms) / maxResponse) * 125;

    return `${x},${y}`;
  }).join(" ");

  const checkStatus = (item) => {
    if (!item.success) return "DOWN";

    if (
      item.response_time_ms != null &&
      Number(item.response_time_ms) > target.threshold_ms
    ) {
      return "SLOW";
    }

    return "UP";
  };

  return (
    <div className="target-details">
      <button type="button" onClick={onBack}>
        ← Back to Monitors
      </button>

      <div className="target-details-header">
        <h2>{target.name}</h2>
        <p>{target.url}</p>
        <span
          className={`target-status target-status--${(
            target.current_status || "UNKNOWN"
          ).toLowerCase()}`}
        >
          {target.current_status || "UNKNOWN"}
        </span>
      </div>

      <div className="target-details-metrics">
        <div>
          <p>Latest Response</p>
          <h3>
            {history[0]?.response_time_ms == null
              ? "—"
              : `${history[0].response_time_ms} ms`}
          </h3>
        </div>

        <div>
          <p>Monitoring</p>
          <h3>{target.enabled ? "Enabled" : "Disabled"}</h3>
        </div>

        <div>
          <p>Check Interval</p>
          <h3>{target.interval_seconds} sec</h3>
        </div>

        <div>
          <p>Threshold</p>
          <h3>{target.threshold_ms} ms</h3>
        </div>
      </div>

      <div className="target-availability-card">
        <div className="availability-header">
          <h3>Website Availability</h3>
          <span>{range}</span>
        </div>

        {availabilityLoading ? (
          <p>Loading availability...</p>
        ) : availabilityError ? (
          <p role="alert">{availabilityError}</p>
        ) : availability?.availabilityPercent == null ? (
          <p>No monitoring checks available for this period.</p>
        ) : (
          <>
            <h2 className="availability-percentage">
              {Number(availability.availabilityPercent).toFixed(2)}%
            </h2>

            <p>Successful monitoring checks</p>

            <div
              className="availability-progress"
              role="progressbar"
              aria-label="Website availability"
              aria-valuenow={availability.availabilityPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="availability-progress-fill"
                style={{
                  width: `${availability.availabilityPercent}%`,
                }}
              />
            </div>

            <div className="availability-stats">
              <div>
                <span>Total Checks</span>
                <strong>{availability.totalChecks}</strong>
              </div>

              <div>
                <span>Successful</span>
                <strong>{availability.successfulChecks}</strong>
              </div>

              <div>
                <span>Failed</span>
                <strong>{availability.failedChecks}</strong>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="target-history-chart">
        <h3>Response-Time History</h3>

        <div className="chart-filters">
          {["1H", "24H", "7D"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              aria-pressed={range === option}
            >
              {option}
            </button>
          ))}
        </div>

        {chartData.length === 0 ? (
          <p>No response-time data in this period.</p>
        ) : (
          <svg
            viewBox="0 0 600 170"
            style={{ width: "100%", height: "180px" }}
            role="img"
            aria-label="Response-time history graph"
          >
            <line
              x1="20"
              y1="145"
              x2="580"
              y2="145"
              stroke="gray"
              opacity="0.35"
            />

            {chartData.length > 1 ? (
              <polyline
                points={points}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ) : (
              <circle
                cx="300"
                cy={
                  145 -
                  (Number(chartData[0].response_time_ms) /
                    maxResponse) *
                  125
                }
                r="5"
                fill="#60a5fa"
              />
            )}
          </svg>
        )}
      </div>

      <div className="target-check-history">
        <h3>Recent Monitoring Checks</h3>

        {filteredHistory.length === 0 ? (
          <p>No monitoring checks in this period.</p>
        ) : (
          <div className="target-table-container">
            <table className="targets-table">
              <thead>
                <tr>
                  <th>Checked At</th>
                  <th>Status</th>
                  <th>Response Time</th>
                  <th>HTTP Code</th>
                </tr>
              </thead>

              <tbody>
                {filteredHistory.slice(0, 10).map((item) => (
                  <tr key={item.id}>
                    <td>
                      {new Date(item.checked_at).toLocaleString()}
                    </td>
                    <td>{checkStatus(item)}</td>
                    <td>
                      {item.response_time_ms == null
                        ? "—"
                        : `${item.response_time_ms} ms`}
                    </td>
                    <td>{item.http_status_code ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TargetDetails;
