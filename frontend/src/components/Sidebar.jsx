function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>NQ Monitor</h2>
      <p>Network Quality Workspace</p>

      <nav>

        <p>
          <a
            href="#overview"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            Overview
          </a>
        </p>

        <p>
          <a
            href="#monitors"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            Monitors
          </a>
        </p>

        <p>
          <a
            href="#incidents"
            style={{
              color: "inherit",
              textDecoration: "none"
            }}
          >
            Incidents
          </a>
        </p>


        <p>
          <a
            href="#reports"
            style={{
              color: "inherit",
              textDecoration: "none"
            }}
          >
            Reports
          </a>
        </p>

        <p>Settings</p>
      </nav>
    </aside>
  );
}

export default Sidebar;