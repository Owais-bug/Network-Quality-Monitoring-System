function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>NQ Monitor</h2>
      <p>Network Quality Workspace</p>

      <nav>
        <p>Overview</p>
        <p>
  <a
    href="#monitors"
    style={{ color: "inherit", textDecoration: "none" }}
  >
    Monitors
  </a>
</p>
        <p>Incidents</p>
        <p>Reports</p>
        <p>Settings</p>
      </nav>
    </aside>
  );
}

export default Sidebar;