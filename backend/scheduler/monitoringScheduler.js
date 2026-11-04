const cron = require("node-cron");

const { getDueTargets } = require("../models/targetModel");

function startMonitoringScheduler() {

    cron.schedule("* * * * *", async () => {

        console.log("Monitoring scheduler triggered:", new Date());

        try {
            const targets = await getDueTargets();

            console.log("Total Due Targets:", targets.length);

            for (const target of targets) {
                console.log(
                    `Due Target: ${target.name} | ID: ${target.id}`
                );
            }

        } catch (error) {
            console.error(
                "Scheduler Error:",
                error.message
            );
        }
    });

    console.log("Monitoring scheduler initialized");
}

module.exports = { startMonitoringScheduler };