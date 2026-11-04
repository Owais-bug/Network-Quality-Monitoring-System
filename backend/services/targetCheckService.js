const {
    checkTarget,
    determineTargetStatus
} = require("./monitoringService");

const {
    saveCheckResult
} = require("../models/checkResultModel");

const {
    updateTargetStatus
} = require("../models/targetModel");

const {
    processTargetEvent
} = require("./eventService");

const performTargetCheck = async (target) => {

    // Step 1: Check website
    const result = await checkTarget(target);

    // Step 2: Determine target status
    const status = determineTargetStatus(
        result,
        target.threshold_ms
    );

    // Step 3: Save monitoring history
    const checkId = await saveCheckResult(result);

    // Step 4: Update current target status
    await updateTargetStatus(
        target.id,
        status,
        result.checked_at
    );

    // Step 5: Process monitoring events
    const event = await processTargetEvent(
        target.id,
        status,
        result.response_time_ms,
        target.critical_threshold_ms
    );

    // Step 6: Return complete result
    return {
        checkId,
        targetId: target.id,
        status,
        result,
        event
    };
};

module.exports = { performTargetCheck };