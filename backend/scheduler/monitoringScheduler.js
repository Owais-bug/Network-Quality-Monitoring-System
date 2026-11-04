const cron = require("node-cron");

const { getDueTargets } = require("../models/targetModel");
const { performTargetCheck } = require("../services/targetCheckService");

let isRunning = false;

function startMonitoringScheduler() {

    cron.schedule("* * * * *", async () => {

        if (isRunning) {
            console.log("Previous monitoring job is still running. Skipping...");
            return;
        }

        isRunning = true;

        console.log("Monitoring scheduler triggered:", new Date());

        try {
            const targets = await getDueTargets();

            console.log("Total Due Targets:", targets.length);

            for (const target of targets) {
                try {
                    const checkData = await performTargetCheck(target);

                    console.log(
                        `Completed: ${target.name} | Status: ${checkData.status}`
                    );
                } catch (error) {
                    console.error(
                        `Failed to process target ${target.id}:`,
                        error.message
                    );
                }
            }

        } catch (error) {
            console.error("Scheduler Error:", error.message);
        } finally {
            isRunning = false;
        }
    });

    console.log("Monitoring scheduler initialized");
}

module.exports = { startMonitoringScheduler };