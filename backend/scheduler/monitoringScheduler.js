
const cron = require("node-cron");

const { getDueTargets } = require("../models/targetModel");
const { performTargetCheck } = require("../services/targetCheckService");

let isRunning = false;

// ========================================
// RUN DUE MONITORING CHECKS
// Works for local scheduler and Vercel API
// ========================================

async function runDueChecks() {

    if (isRunning) {
        console.log("Previous monitoring job is still running.");

        return {
            skipped: true,
            message: "Monitoring job already running"
        };
    }

    isRunning = true;

    console.log("Monitoring triggered:", new Date());

    const summary = {
        totalDue: 0,
        completed: 0,
        failed: 0
    };

    try {
        const targets = await getDueTargets();

        summary.totalDue = targets.length;

        console.log("Total Due Targets:", targets.length);

        for (const target of targets) {
            try {
                const checkData = await performTargetCheck(target);

                summary.completed++;

                console.log(
                    `Completed: ${target.name} | Status: ${checkData.status}`
                );

            } catch (error) {

                summary.failed++;

                console.error(
                    `Failed to process target ${target.id}:`,
                    error.message
                );
            }
        }

        return {
            success: true,
            ...summary
        };

    } catch (error) {

        console.error("Monitoring Error:", error.message);

        throw error;

    } finally {

        isRunning = false;
    }
}

// ========================================
// LOCAL AUTOMATIC SCHEDULER
// ========================================

function startMonitoringScheduler() {

    cron.schedule("* * * * *", async () => {

        try {
            await runDueChecks();

        } catch (error) {
            console.error(
                "Scheduler Error:",
                error.message
            );
        }
    });

    console.log("Monitoring scheduler initialized");
}

module.exports = {
    startMonitoringScheduler,
    runDueChecks
};
