import CountUp from "./CountUp";
function SummaryCards({ loading = false, summary }) {
    
  if (loading) {
    return (
      <div
        className="summary-cards"
        aria-busy="true"
        aria-label="Loading summary cards"
      >
        {["Total Monitors", "UP", "SLOW", "DOWN", "Open Events"].map(
          (title) => (
            <div className="summary-card" key={title}>
              <h3>{title}</h3>
              <div className="skeleton-number"></div>
            </div>
          )
        )}
      </div>
    );
  }

 
return (
  <div className="summary-cards">
    <div className="summary-card">
      <h3>Total Monitors</h3>
      <p>
        <CountUp value={summary?.totalTargets ?? 0} />
      </p>
    </div>

    <div className="summary-card">
      <h3>UP</h3>
      <p>
        <CountUp value={summary?.upTargets ?? 0} />
      </p>
    </div>

    <div className="summary-card">
      <h3>SLOW</h3>
      <p>
        <CountUp value={summary?.slowTargets ?? 0} />
      </p>
    </div>

    <div className="summary-card">
      <h3>DOWN</h3>
      <p>
        <CountUp value={summary?.downTargets ?? 0} />
      </p>
    </div>

    <div className="summary-card">
      <h3>Open Events</h3>
      <p>
        <CountUp value={summary?.activeEvents ?? 0} />
      </p>
    </div>
  </div>
);

}

export default SummaryCards;
