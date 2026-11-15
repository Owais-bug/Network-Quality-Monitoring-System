
Network Quality Monitoring System
A full-stack web application for monitoring the availability and HTTP response time of websites and network targets. NQ Monitor provides a dashboard to view current health, review historical checks, investigate incidents, and export monitoring reports.

Tech Stack
Layer	Technology
Frontend	React, Vite, JavaScript, CSS
Backend	Node.js, Express.js
Database	MySQL
Version Control	Git, GitHub
Features
Overview Dashboard: Total monitors, UP, SLOW, DOWN, and open-event summary cards, monitor distribution, and monitoring snapshot.
Target Management: Add, edit, enable/disable, and remove (archive) monitored targets.
HTTP Monitoring: Periodic website checks, response-time measurement, HTTP status recording, and configurable check intervals and performance thresholds.
Status Indicators: UP, SLOW, DOWN, and UNKNOWN states based on monitoring results.
Target Details: Latest response time, status, check interval, threshold, response-time history chart, and recent checks.
Time Filters: 1-hour, 24-hour, and 7-day views for the target's history and availability metrics.
Availability Metrics: Percentage of successful recorded checks, plus total, successful, and failed check counts.
Incidents: Event log with filtering by severity, status, and date.
Reports: Download CSV monitoring reports with website and date filters.
Dashboard Refresh: Automatic refresh of dashboard data approximately every 60 seconds.
Appearance: Dark and light themes, responsive layouts, and dashboard animations.
Project Structure
Network-Monitoring-System/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
├── .gitignore
└── README.md
This is the top-level project layout. Other backend files and directories may exist depending on your local version.

Getting Started
Prerequisites
Node.js and npm
MySQL Server
A local copy of this repository
1. Set Up the Database
Create a MySQL database named network_quality_monitor and apply the project's existing database schema for targets, monitoring results, and events. Configure the backend's existing MySQL connection settings for your local server.

Do not commit database passwords or other secrets to GitHub.

2. Start the Backend
cd backend
npm install
node server.js
The backend normally runs at http://localhost:5000.

3. Start the Frontend
In a second terminal:

cd frontend
npm install
npm run dev
Open the URL printed by Vite (normally http://localhost:5173).

Ensure the frontend's /api requests reach the Express server through the existing Vite proxy or API configuration.

Key API Endpoints
Method	Endpoint	Purpose
GET	/api/dashboard/summary	Dashboard status summary
GET	/api/targets	List monitored targets
GET	/api/targets/:id	View a single target
GET	/api/targets/:id/history?limit=500	Recent monitoring results
GET	/api/targets/:id/availability?hours=24	Check-based availability
GET	/api/events	Incidents and events
GET	/api/reports/checks.csv	Export monitoring checks as CSV
For availability, hours currently accepts 1, 24, or 168 (1H, 24H, 7D).

How Monitoring Status Works
UP: The request succeeds and its response time is within the configured threshold.
SLOW: The request succeeds, but its response time exceeds the threshold.
DOWN: The request fails according to the backend's HTTP success rules.
UNKNOWN: No usable monitoring result has been recorded yet.
Threshold (ms) determines the acceptable HTTP response time. Interval (seconds) determines how frequently the target is checked.

HTTP response time is not the same as CMD ping. An HTTP check may include connection setup, TLS negotiation, and the server response; ping measures an ICMP round-trip when supported.

Availability Calculation
Availability is calculated from recorded checks within the selected time period:

Availability (%) = (Successful Checks / Total Checks) × 100
If there are no checks in the selected period, availability is shown as N/A, not 100%. This is a check-based availability metric, not an exact continuous-uptime measurement.

Known Limitations / Next Improvements
HTTP redirects: Some 3xx responses (for example, 301) may be classified as failures by the current HTTP success logic. Following and evaluating the final redirect destination is a planned improvement.
History limit: The current details view requests up to 500 historical checks; periods with more records may show an incomplete history chart.
Final validation: Comprehensive security, reliability, responsiveness, and edge-case testing are still to be completed.
Development Status
The principal dashboard, target-management, history, incident, reporting, and availability features are implemented. Final testing, security/reliability review, and GitHub/portfolio polishing remain in progress.

License
No license has been specified for this project yet.





