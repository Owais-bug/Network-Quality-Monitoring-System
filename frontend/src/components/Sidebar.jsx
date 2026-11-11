import uptimeXLogo from "./assets/UptimeX-sidebar-logo.png";
import { useEffect, useState } from "react";

const SidebarIcon = ({ name }) => {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (name) {
    case "Overview":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );

    case "Monitors":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M6 13h3l2-4 3 7 2-3h2" />
        </svg>
      );

    case "Incidents":
      return (
        <svg {...common}>
          <path d="M10.3 3.8 2.5 17.5A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.5L13.7 3.8a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      );

    case "Reports":
      return (
        <svg {...common}>
          <rect x="4" y="13" width="3" height="7" rx="1" />
          <rect x="10" y="8" width="3" height="12" rx="1" />
          <rect x="16" y="4" width="3" height="16" rx="1" />
        </svg>
      );

    default:
      return null;
  }
};


const menuItems = [
  { name: "Overview", href: "#overview", color: "#60a5fa" },
  { name: "Monitors", href: "#monitors", color: "#34d399" },
  { name: "Incidents", href: "#incidents", color: "#fbbf24" },
  { name: "Reports", href: "#reports", color: "#c4b5fd" },
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
  
<div className="sidebar-logo">
  <svg
    className="uptimex-live-logo"
    viewBox="0 0 64 64"
    width="54"
    height="54"
    role="img"
    aria-label="UptimeX monitoring logo"
    fill="none"
  >
    {/* Monitor Outline */}
    <rect
      x="7"
      y="12"
      width="50"
      height="37"
      rx="5"
      stroke="#12d9ed"
      strokeWidth="3"
    />

    {/* Animated Heartbeat */}
    <path
      className="uptimex-heartbeat-line"
      d="M12 33 H22 L27 26 L33 43 L40 19 L45 33 H52"
      stroke="#22d3ee"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Monitor Stand */}
    <path
      d="M24 56 H40 M32 49 V56"
      stroke="#2186f9"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
</div>


  <div className="sidebar-brand-text">
    <h2>UptimeX</h2>
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
            <span
  className="sidebar-nav-icon"
  style={{ color: item.color }}
  aria-hidden="true"
>
  <SidebarIcon name={item.name} />
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
