
import { useEffect, useState } from "react";

const menuItems = [
  { name: "Overview", icon: "▦", href: "#overview" },
  { name: "Monitors", icon: "▣", href: "#monitors" },
  { name: "Incidents", icon: "⚠", href: "#incidents" },
  { name: "Reports", icon: "▤", href: "#reports" },
];

function Sidebar() {
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState(
    window.location.hash || "#overview"
  );

  useEffect(() => {
    const updatePage = () => {
      setActivePage(window.location.hash || "#overview");
    };

    window.addEventListener("hashchange", updatePage);

    return () => {
      window.removeEventListener("hashchange", updatePage);
    };
  }, []);

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">NQ</div>

        <div className="sidebar-brand-text">
          <h2>NQ Monitor</h2>
          <p>Network Quality Workspace</p>
        </div>
      </div>

      <div className="sidebar-search">
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          placeholder="Search"
          aria-label="Search navigation"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <nav className="sidebar-navigation" aria-label="Main navigation">
        {filteredItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={`sidebar-nav-link ${
              activePage === item.href ? "active" : ""
            }`}
          >
            <span className="sidebar-nav-icon" aria-hidden="true">
              {item.icon}
            </span>

            <span>{item.name}</span>
          </a>
        ))}

        {filteredItems.length === 0 && (
          <p className="sidebar-no-results">No matching pages</p>
        )}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-nav-link sidebar-nav-disabled">
          <span className="sidebar-nav-icon" aria-hidden="true">⚙</span>
          <span>Settings</span>
          <small>Coming soon</small>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
