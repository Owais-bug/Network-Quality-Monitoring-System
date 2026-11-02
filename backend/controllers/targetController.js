// Phase 7: Event Handling
const {
    processTargetEvent
} = require("../services/eventService");
const {
    getAllTargets,
    createTarget,
    getTargetById,
    updateTarget,
    setTargetEnabled,
    updateTargetStatus,
    deleteTarget
} = require("../models/targetModel");

// Phase 6: Monitoring functions
const {
    checkTarget,
    determineTargetStatus
} = require("../services/monitoringService");

const {
    saveCheckResult
} = require("../models/checkResultModel");

const getTargets = async (req, res, next) => {
    try {
        const targets = await getAllTargets();

        res.status(200).json(targets);
    } catch (error) {
        next(error);
    }
};

const addTarget = async (req, res, next) => {
    try {
        const {
            name,
            url,
            interval_seconds = 60,
            threshold_ms = 1000
        } = req.body || {};

        // Validate target name
        if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
            return res.status(400).json({
                message: "Valid target name is required (max 100 characters)"
            });
        }

        // Validate URL
        let parsedUrl;

        try {
            parsedUrl = new URL(url);

            if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                throw new Error("Invalid protocol");
            }

            if (parsedUrl.username || parsedUrl.password) {
                throw new Error("Credentials are not allowed");
            }

            if (parsedUrl.hostname.length > 100 || url.length > 255) {
                throw new Error("URL too long");
            }
        } catch {
            return res.status(400).json({
                message: "Enter a valid HTTP or HTTPS URL"
            });
        }

        // Validate interval and threshold
        if (!Number.isInteger(interval_seconds) || interval_seconds < 10) {
            return res.status(400).json({
                message: "Interval must be an integer of at least 10 seconds"
            });
        }

        if (!Number.isInteger(threshold_ms) || threshold_ms < 1) {
            return res.status(400).json({
                message: "Threshold must be a positive integer"
            });
        }

        const host = parsedUrl.hostname.toLowerCase();

        const targetId = await createTarget(
            name.trim(),
            host,
            parsedUrl.href,
            interval_seconds,
            threshold_ms
        );

        res.status(201).json({
            message: "Target added successfully",
            targetId
        });

    } catch (error) {
        next(error);
    }
};

const getSingleTarget = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid target ID"
            });
        }

        const target = await getTargetById(id);

        if (!target) {
            return res.status(404).json({
                message: "Target not found"
            });
        }

        res.status(200).json(target);

    } catch (error) {
        next(error);
    }
};

const editTarget = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        // Validate ID
        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid target ID"
            });
        }

        // Find existing target
        const existingTarget = await getTargetById(id);

        if (!existingTarget) {
            return res.status(404).json({
                message: "Target not found"
            });
        }

        // Get updated values or keep old values
        const {
            name = existingTarget.name,
            url = existingTarget.url,
            interval_seconds = existingTarget.interval_seconds,
            threshold_ms = existingTarget.threshold_ms
        } = req.body || {};

        // Validate name
        if (typeof name !== "string" ||
            !name.trim() ||
            name.trim().length > 100) {
            return res.status(400).json({
                message: "Valid target name is required"
            });
        }

        // Validate URL
        let parsedUrl;

        try {
            if (typeof url !== "string" || url.length > 255) {
                throw new Error("Invalid URL");
            }

            parsedUrl = new URL(url);

            if (!["http:", "https:"].includes(parsedUrl.protocol) ||
                parsedUrl.username ||
                parsedUrl.password ||
                parsedUrl.hostname.length > 100) {
                throw new Error("Invalid URL");
            }
        } catch {
            return res.status(400).json({
                message: "Enter a valid HTTP or HTTPS URL"
            });
        }

        // Validate interval
        if (!Number.isInteger(interval_seconds) ||
            interval_seconds < 10) {
            return res.status(400).json({
                message: "Interval must be at least 10 seconds"
            });
        }

        // Validate threshold
        if (!Number.isInteger(threshold_ms) ||
            threshold_ms < 1) {
            return res.status(400).json({
                message: "Threshold must be a positive integer"
            });
        }

        const host = parsedUrl.hostname.toLowerCase();

        // Update database
        await updateTarget(
            id,
            name.trim(),
            host,
            parsedUrl.href,
            interval_seconds,
            threshold_ms
        );

        res.status(200).json({
            message: "Target updated successfully",
            targetId: id
        });

    } catch (error) {
        next(error);
    }
};

const toggleTarget = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { enabled } = req.body || {};

        // Validate target ID
        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid target ID"
            });
        }

        // Validate enabled value
        if (typeof enabled !== "boolean") {
            return res.status(400).json({
                message: "enabled must be true or false"
            });
        }

        // Check if target exists
        const existingTarget = await getTargetById(id);

        if (!existingTarget) {
            return res.status(404).json({
                message: "Target not found"
            });
        }

        // Convert boolean to MySQL value
        const enabledValue = enabled ? 1 : 0;

        // Update target
        await setTargetEnabled(id, enabledValue);

        res.status(200).json({
            message: enabled
                ? "Target enabled successfully"
                : "Target disabled successfully",
            targetId: id,
            enabled: enabledValue
        });

    } catch (error) {
        next(error);
    }
};

const removeTarget = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        // Validate target ID
        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid target ID"
            });
        }

        // Check if target exists
        const existingTarget = await getTargetById(id);

        if (!existingTarget) {
            return res.status(404).json({
                message: "Target not found"
            });
        }

        // Delete target from database
        const deletedRows = await deleteTarget(id);

        if (deletedRows === 0) {
            return res.status(404).json({
                message: "Target not found"
            });
        }

        res.status(200).json({
            message: "Target deleted successfully",
            targetId: id
        });

    } catch (error) {
        next(error);
    }
};

// Phase 6: Run a manual monitoring check
const runTargetCheck = async (req, res, next) => {
    try {
        // Step 1: Get target ID from URL
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid target ID"
            });
        }

        // Step 2: Find target in MySQL
        const target = await getTargetById(id);

        if (!target) {
            return res.status(404).json({
                message: "Target not found"
            });
        }

        // Step 3: Run monitoring check
        const result = await checkTarget(target);

        // Step 4: Calculate UP, SLOW or DOWN
        const status = determineTargetStatus(
            result,
            target.threshold_ms
        );

        // Step 5: Save monitoring history
        const checkId = await saveCheckResult(result);

        // Step 6: Update target's current status
        await updateTargetStatus(
            target.id,
            status,
            result.checked_at
        );
        const event = await processTargetEvent(
            target.id,
            status,
            result.response_time_ms,
            target.critical_threshold_ms
        );
        console.log("PHASE 7 EVENT DEBUG:", event);
        // Step 7: Return API response
        res.status(200).json({
            message: "Monitoring check completed",
            checkId,
            targetId: target.id,
            status,
            result,
            event
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    getTargets,
    addTarget,
    getSingleTarget,
    editTarget,
    toggleTarget,
    removeTarget,
    runTargetCheck
};