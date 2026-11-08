
import { useState } from "react";

function TargetForm({ onTargetAdded }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [interval, setInterval] = useState(60);
  const [threshold, setThreshold] = useState(1000);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submit button clicked!");

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/targets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          url: url.trim(),
          interval_seconds: Number(interval),
          threshold_ms: Number(threshold),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to add website");
        return;
      }

      setMessage(data.message || "Target added successfully");
      onTargetAdded();

      setName("");
      setUrl("");
      setInterval(60);
      setThreshold(1000);
      setIsAddOpen(false);

    } catch (error) {
      console.error("Error adding website:", error);
      setMessage("Unable to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-website-section">

      {/* Open Add Website Form */}
      <button
        type="button"
        className="add-website-trigger"
        onClick={() => setIsAddOpen(true)}
      >
        + Add Website
      </button>
      {/* Add Website Modal Background */}
      {isAddOpen && (
        <div
          className="target-modal-backdrop"
          aria-hidden="true"
        />
      )}
      {isAddOpen && (
        <div className="target-form-card">

          {/* Close Button */}
          <button
            type="button"
            className="add-modal-close"
            onClick={() => setIsAddOpen(false)}
            aria-label="Close add website form"
          >
            ×
          </button>

          <h2>Add New Website</h2>
          <p>Enter website details to start monitoring.</p>

          <form onSubmit={handleSubmit}>

            <div>
              <label htmlFor="name">Website Name:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter website name"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label htmlFor="url">Website URL:</label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="interval">Interval (seconds):</label>
              <input
                type="number"
                id="interval"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                min="10"
                step="1"
                required
              />
            </div>

            <div>
              <label htmlFor="threshold">Threshold (ms):</label>
              <input
                type="number"
                id="threshold"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                min="1"
                step="1"
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Website"}
            </button>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </form>

          {message && <p role="status">{message}</p>}

        </div>
      )}

    </div>
  );



}

export default TargetForm;
