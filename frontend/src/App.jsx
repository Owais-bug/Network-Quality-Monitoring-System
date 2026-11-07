
import { useState, useEffect } from "react";

import Sidebar from "./components/Sidebar";
import TargetForm from "./components/TargetForm";
import TargetList from "./components/TargetList";
import Navbar from "./components/Navbar";
import SummaryCards from "./components/SummaryCards";

function App() {
  const [refreshCount, setRefreshCount] = useState(0);
    const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  const refreshTargets = () => {
    setRefreshCount((count) => count + 1);
  };

  // Remember selected theme
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("nq-theme") === "dark"
      ? "dark"
      : "light";
  });

  // Apply theme and save preference
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem("nq-theme", theme);
  }, [theme]);


  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard/summary")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        console.log("Dashboard Summary:", data.summary);
        setSummary(data.summary);
      })
      .catch((error) => {
        console.error("Summary API Error:", error);
         setSummaryError("Unable to load dashboard summary.");
      })
      .finally(() => {
        setSummaryLoading(false);
      });
  }, [refreshCount]);

  // Switch between Light and Dark
  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "light" ? "dark" : "light"
    );
  };

  return (
    <div className="app-layout">

      <Sidebar />

      <Navbar theme={theme} onToggleTheme={toggleTheme} />

      <h1>Network Quality Monitoring System</h1>
      <p>Welcome to our React Dashboard!</p>
     
{summaryError ? (
  <div className="summary-error" role="alert">
    <strong>Dashboard Summary Unavailable</strong>
    <p>{summaryError}</p>
  </div>
) : (
  <SummaryCards
    summary={summary}
    loading={summaryLoading}
  />
)}


      <TargetForm onTargetAdded={refreshTargets} />

      <section id="monitors">
        <TargetList refreshCount={refreshCount} 
        onTargetsChanged={refreshTargets}/>
      </section>



    </div>
  );
}

export default App;
