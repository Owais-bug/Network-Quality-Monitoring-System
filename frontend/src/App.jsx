
import { useState, useEffect } from "react";
import TypingHeading from "./components/TypingHeading";
import Sidebar from "./components/Sidebar";
import TargetForm from "./components/TargetForm";
import TargetList from "./components/TargetList";
import Navbar from "./components/Navbar";
import SummaryCards from "./components/SummaryCards";
import Incidents from "./components/Incidents";
import Reports from "./components/Reports";
import OverviewHealth from "./components/OverviewHealth";
import OverviewWebsites from "./components/OverviewWebsites";
function App() {
  const [refreshCount, setRefreshCount] = useState(0);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  // Track selected sidebar page

  const getActivePage = () => {
    const page = window.location.hash.replace("#", "");

    return ["overview", "monitors", "reports", "incidents"].includes(page)
      ? page
      : "overview";
  };

  const [activePage, setActivePage] = useState(getActivePage);


  // Handle sidebar navigation
  useEffect(() => {
    const handleNavigation = () => {
      setActivePage(getActivePage());
    };

    window.addEventListener("hashchange", handleNavigation);

    return () => {
      window.removeEventListener(
        "hashchange",
        handleNavigation
      );
    };
  }, []);

  // Refresh dashboard and targets
  const refreshTargets = () => {
    setRefreshCount((count) => count + 1);
  };

  /* Automatic Dashboard Refresh - Every 60 Seconds */
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCount((count) => count + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);


  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("nq-theme") === "dark"
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem("nq-theme", theme);
  }, [theme]);

  // Fetch dashboard summary
  useEffect(() => {
    setSummaryLoading(true);
    setSummaryError(null);
   fetch("/api/dashboard/summary")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        setSummary(data.summary);
        setSummaryError(null);
      })
      .catch((error) => {
        console.error("Summary API Error:", error);
        setSummaryError(
          "Unable to load dashboard summary."
        );
      })
      .finally(() => {
        setSummaryLoading(false);
      });
  }, [refreshCount]);

  // Toggle Dark / Light Mode
  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "light" ? "dark" : "light"
    );
  };

  return (

    <div className="app-layout">

      <Sidebar />

      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* OVERVIEW PAGE */}
      {activePage === "overview" && (
        <section id="overview">

          <TypingHeading text="Network Quality Monitoring System." />

          <p>Network Performance Overview</p>

          {summaryError ? (
            <div className="summary-error" role="alert">
              <strong>Dashboard Summary Unavailable</strong>
              <p>{summaryError}</p>
            </div>
          ) : (
  <>
    <div className="summary-group-motion">
      <SummaryCards
        summary={summary}
        loading={summaryLoading}
      />
    </div>

    {!summaryLoading && !summaryError && (
      <OverviewHealth summary={summary} />
    )}
    
<OverviewWebsites refreshCount={refreshCount} />

  </>


          )}
        </section>
      )}

      {/* MONITORS PAGE */}
      {activePage === "monitors" && (
        <section id="monitors">

          <TypingHeading text="Monitors." />


          <TargetForm onTargetAdded={refreshTargets} />

          <TargetList
            refreshCount={refreshCount}
            onTargetsChanged={refreshTargets}
          />
        </section>
      )}

      {/* INCIDENTS PAGE */}
      {activePage === "incidents" && (
        <Incidents />

      )}

      {/* REPORTS PAGE */}
      {activePage === "reports" && (
        <Reports />
      )}


    </div>
  );
}

export default App;
