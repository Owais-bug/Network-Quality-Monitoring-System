import TargetTable from "./TargetTable";
import { useState, useEffect } from "react";
import TargetDetails from "./TargetDetails";
function TargetList({ refreshCount, onTargetsChanged }) {

    const [targets, setTargets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingTarget, setEditingTarget] = useState(null);

    const [selectedTargetId, setSelectedTargetId] = useState(null);


    // Fetch all targets from backend
    useEffect(() => {
        const fetchTargets = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch("/api/targets");

                if (!response.ok) {
                    throw new Error("Failed to fetch targets");
                }

                const data = await response.json();
                setTargets(data);

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTargets();

    }, [refreshCount]);


    // Enable or Disable a target
    const handleToggle = async (id, currentEnabled) => {
        try {
            const newEnabled = currentEnabled === 1 ? false : true;

            const response = await fetch(`/api/targets/${id}/enabled`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    enabled: newEnabled,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to update target");
                return;
            }

            // Update React state after successful API response
            setTargets((previousTargets) =>
                previousTargets.map((target) =>
                    target.id === id
                        ? { ...target, enabled: newEnabled ? 1 : 0 }
                        : target
                )
            );

            // Notify parent to refresh dashboard data
            onTargetsChanged();

            alert(data.message);

        } catch (error) {
            console.error("Error updating target:", error);
            alert("Unable to update target");
        }
    };

    const handleDelete = async (id, name) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/api/targets/${id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to delete target");
                return;
            }

            setTargets((previousTargets) =>
                previousTargets.filter((target) => target.id !== id)
            );

            // Notify App.jsx to refresh dashboard summary
            onTargetsChanged();

            alert(data.message);

        } catch (error) {
            console.error("Error deleting target:", error);
            alert("Unable to delete target");
        }
    };

    const handleSave = async () => {
        if (!editingTarget) return;

        try {
            const response = await fetch(
                `/api/targets/${editingTarget.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: editingTarget.name,
                        url: editingTarget.url,
                        interval_seconds: Number(editingTarget.interval_seconds),
                        threshold_ms: Number(editingTarget.threshold_ms),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to update target");
                return;
            }

            // Update React list with edited values
            setTargets((previousTargets) =>
                previousTargets.map((target) =>
                    target.id === editingTarget.id
                        ? {
                            ...target,
                            name: editingTarget.name,
                            url: editingTarget.url,
                            interval_seconds: Number(editingTarget.interval_seconds),
                            threshold_ms: Number(editingTarget.threshold_ms),
                        }
                        : target
                )
            );

            setEditingTarget(null);
            onTargetsChanged();
            alert("Target updated successfully");

        } catch (error) {
            console.error("Error saving target:", error);
            alert("Unable to save changes");
        }
    };

    if (selectedTargetId !== null) {
        return (
            <TargetDetails
                targetId={selectedTargetId}
                onBack={() => setSelectedTargetId(null)}
            />
        );
    }

    return (
        <div>
            <h2>Monitored Websites</h2>

            {loading && <p>Loading websites...</p>}

            {error && <p role="alert">{error}</p>}

            {!loading && !error && targets.length === 0 && (
                <p>No websites found.</p>
            )}

            {!loading && !error && targets.length > 0 && (
                <TargetTable
                    targets={targets}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onEdit={setEditingTarget}
                    onViewDetails={setSelectedTargetId}
                />
            )}
            {editingTarget && (
                <div
                    className="target-modal-backdrop"
                    aria-hidden="true"
                />
            )}
            {editingTarget && (
                <div className="target-edit-card">
                    <button
                        type="button"
                        className="target-modal-close"
                        onClick={() => setEditingTarget(null)}
                        aria-label="Close edit form"
                    >
                        ×
                    </button>

                    <h3>Editing Website: {editingTarget.name}</h3>

                    <div>
                        <label>Website Name:</label>
                        <input
                            type="text"
                            value={editingTarget.name}
                            onChange={(e) =>
                                setEditingTarget({
                                    ...editingTarget,
                                    name: e.target.value
                                })
                            }
                        />
                    </div>

                    <div>
                        <label>Website URL:</label>
                        <input
                            type="url"
                            value={editingTarget.url}
                            onChange={(e) =>
                                setEditingTarget({
                                    ...editingTarget,
                                    url: e.target.value
                                })
                            }
                        />
                    </div>

                    <div>
                        <label>Interval (seconds):</label>
                        <input
                            type="number"
                            min="10"
                            step="1"
                            value={editingTarget.interval_seconds}
                            onChange={(e) =>
                                setEditingTarget({
                                    ...editingTarget,
                                    interval_seconds: e.target.value
                                })
                            }
                        />
                    </div>

                    <div>
                        <label>Threshold (ms):</label>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={editingTarget.threshold_ms}
                            onChange={(e) =>
                                setEditingTarget({
                                    ...editingTarget,
                                    threshold_ms: e.target.value
                                })
                            }
                        />
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={handleSave}
                        >
                            Save Changes
                        </button>

                        <button
                            type="button"
                            onClick={() => setEditingTarget(null)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TargetList;


