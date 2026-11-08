import TypingHeading from "./TypingHeading";
import { useEffect, useState } from "react";

function Reports() {
  const [targets, setTargets] = useState([]);
  const [targetId, setTargetId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [limit, setLimit] = useState(1000);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTargets() {
      try {
        const response = await fetch("/api/targets", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load websites.");
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
    }

    fetchTargets();

    return () => controller.abort();
  }, []);

  const handleDownload = (e) => {
    e.preventDefault();
    setError("");

    if (fromDate && toDate && fromDate > toDate) {
      setError("From Date cannot be after To Date.");
      return;
    }

    const params = new URLSearchParams();

    if (targetId) params.set("targetId", targetId);
    if (fromDate) params.set("fromDate", fromDate);
    if (toDate) params.set("toDate", toDate);

    params.set("limit", String(limit));

    const url =
      `http://localhost:5000/api/reports/checks.csv?${params.toString()}`;

    window.location.assign(url);
  };

  return (
    <section className="reports-page">
       <TypingHeading text="Reports." />
      <p>Export monitoring history as CSV.</p>


<div className="reports-split-layout">

  <div className="reports-info-panel">
    <div className="reports-info-icon">↓</div>

    <h2>Export Monitoring Data</h2>

    <p>
      Download website performance records
      with response times, timestamps
      and HTTP status codes.
    </p>

    <span>CSV FORMAT · MYSQL HISTORY</span>
  </div>

  {/* Existing CSV Export Form */}


      <form onSubmit={handleDownload}>
        <div>
          <label htmlFor="report-target">Website</label>
          <select
            id="report-target"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            disabled={loading}
          >
            <option value="">All Websites</option>

            {targets.map((target) => (
              <option key={target.id} value={target.id}>
                {target.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="report-from">From Date</label>
          <input
            id="report-from"
            type="date"
            value={fromDate}
            max={toDate || undefined}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="report-to">To Date</label>
          <input
            id="report-to"
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="report-limit">Maximum Records</label>
          <select
            id="report-limit"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value={100}>100 Records</option>
            <option value={500}>500 Records</option>
            <option value={1000}>1000 Records</option>
          </select>
        </div>

        <button type="submit">
          Download CSV
        </button>

        {error && <p role="alert">{error}</p>}
      </form>
      </div>
    </section>
  );
}

export default Reports;
