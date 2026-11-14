
import { useEffect, useState } from "react";

import TypingHeading from "./TypingHeading";

function Incidents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [severity, setSeverity] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/events?limit=500",
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to load incidents");
        }

        const data = await response.json();
        setEvents(data.events || []);

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

    fetchEvents();

    return () => controller.abort();
  }, []);

  // ========================================
  // FILTER OPTIONS
  // ========================================

  const severityOptions = [
    ...new Set(
      events.map((event) => event.severity).filter(Boolean)
    ),
  ].sort();

  // Date range boundaries in user's local timezone
  const startTime = fromDate
    ? new Date(`${fromDate}T00:00:00`).getTime()
    : null;

  const endTime = toDate
    ? new Date(`${toDate}T00:00:00`).getTime() +
      24 * 60 * 60 * 1000
    : null;

  const filteredEvents = events.filter((event) => {
    const eventTime = new Date(event.created_at).getTime();

    const matchesSeverity =
      severity === "ALL" || event.severity === severity;

    const matchesStatus =
      status === "ALL" ||
      (status === "OPEN" && !event.resolved_at) ||
      (status === "RESOLVED" && Boolean(event.resolved_at));

    const matchesFrom =
      startTime === null || eventTime >= startTime;

    const matchesTo =
      endTime === null || eventTime < endTime;

    return (
      matchesSeverity &&
      matchesStatus &&
      matchesFrom &&
      matchesTo
    );
  });

  // ========================================
  // RESET FILTERS
  // ========================================

  const resetFilters = () => {
    setSeverity("ALL");
    setStatus("ALL");
    setFromDate("");
    setToDate("");
  };

  return (
    <section className="incidents-page">

      <TypingHeading text="Incidents." />

      <p>Monitor network issues and event history.</p>

      {/* ========================================
          INCIDENT FILTERS
      ======================================== */}

      <div className="incident-filters">

        <label>
          Severity
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            <option value="ALL">All Severities</option>

            {severityOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label>
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </label>

        <label>
          From Date
          <input
            type="date"
            value={fromDate}
            max={toDate || undefined}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </label>

        <label>
          To Date
          <input
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(e) => setToDate(e.target.value)}
          />
        </label>

        <button
          type="button"
          onClick={resetFilters}
        >
          Clear Filters
        </button>

      </div>

      {/* ========================================
          LOADING AND ERROR
      ======================================== */}

      {loading && <p>Loading incidents...</p>}

      {error && <p role="alert">{error}</p>}

      {/* ========================================
          INCIDENT HISTORY
      ======================================== */}

      {!loading && !error && (
        <>
          <p>
            Showing {filteredEvents.length} of {events.length}{" "}
            fetched incidents
          </p>

          {filteredEvents.length === 0 ? (
            <p>No incidents found for selected filters.</p>
          ) : (

            <div className="target-table-container incidents-responsive-table">

              <table className="targets-table">

                <thead>
                  <tr>
                    <th>Website</th>
                    <th>Event Type</th>
                    <th>Severity</th>
                    <th>Description</th>
                    <th>Created At</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event.id}>

                      <td data-label="Website">
                        {event.target_name}
                      </td>

                      <td data-label="Event Type">
                        <span
                          className={`incident-event-type incident-event-type--${event.event_type?.toLowerCase()}`}
                        >
                          {event.event_type}
                        </span>
                      </td>

                      <td data-label="Severity">
                        <span
                          className={`incident-severity incident-severity--${event.severity?.toLowerCase()}`}
                        >
                          {event.severity}
                        </span>
                      </td>

                      <td data-label="Description">
                        {event.message}
                      </td>

                      <td data-label="Created At">
                        {new Date(
                          event.created_at
                        ).toLocaleString()}
                      </td>

                      <td data-label="Status">
                        {event.resolved_at
                          ? "Resolved"
                          : "Open"}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </>
      )}

    </section>
  );
}

export default Incidents;
