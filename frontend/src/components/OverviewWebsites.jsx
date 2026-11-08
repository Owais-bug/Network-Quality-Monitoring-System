
import { useEffect, useState } from "react";

function OverviewWebsites({ refreshCount }) {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadTargets = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/targets", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load website health.");
        }

        const data = await response.json();
        setTargets(data);

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

    loadTargets();

    return () => controller.abort();
  }, [refreshCount]);


return (
  <section className="overview-websites">

    {/* Section Header */}
    <div className="overview-websites-header">
      <h2>Monitored Websites</h2>
      <a href="#monitors">View All Monitors</a>
    </div>

    {loading && <p>Loading website health...</p>}

    {error && <p role="alert">{error}</p>}

    {!loading && !error && targets.length === 0 && (
      <p>No monitored websites found.</p>
    )}

    {!loading && !error && targets.length > 0 && (
      <div className="overview-websites-grid">

        {targets.map((target) => {
          const status = target.current_status || "UNKNOWN";

          return (
            <div
              key={target.id}
              className={`overview-website-card overview-website-card--${status.toLowerCase()}`}
            >

              {/* Top Accent */}
              <div className="overview-website-top">
                <span className="overview-website-accent"></span>
                <span className="overview-website-icon">⌁</span>
              </div>

              {/* Website Name */}
              <h3>{target.name}</h3>

              {/* Status */}
              <div className="overview-website-status">
                <span className="overview-website-dot"></span>
                <span>{status}</span>
              </div>

              {/* Response Time */}
              <div className="overview-website-response">
                <strong>
                  {target.latest_response_time_ms == null
                    ? "—"
                    : target.latest_response_time_ms}
                </strong>

                {target.latest_response_time_ms != null && (
                  <span>ms</span>
                )}
              </div>

              <small>Last recorded response</small>

              {/* Monitoring State */}
              <div className="overview-website-footer">
                <span>Monitoring</span>
                <strong>
                  {Number(target.enabled) === 1
                    ? "Enabled"
                    : "Disabled"}
                </strong>
              </div>

            </div>
          );
        })}

      </div>
    )}

  </section>
);


 
}

export default OverviewWebsites;
