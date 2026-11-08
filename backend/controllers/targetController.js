
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

const {
    performTargetCheck
} = require("../services/targetCheckService");

const {
    saveCheckResult,
    getTargetHistory,
    getTargetAvailability
} = require("../models/checkResultModel");



// ========================================
// GET ALL TARGETS + STATUS FILTERING
// Phase 9
// ========================================

const getTargets = async (req, res, next) => {
    try {
        const { status } = req.query;
        console.log("PHASE 9 DEBUG - Received status:", status);

        const allowedStatuses = [
            "UP",
            "SLOW",
            "DOWN",
            "UNKNOWN"
        ];

        // Validate status if provided
        if (
            status !== undefined &&
            (
                typeof status !== "string" ||
                !allowedStatuses.includes(status)
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid status. Use UP, SLOW, DOWN, or UNKNOWN"
            });
        }

        // Fetch all or filtered targets
        const targets = await getAllTargets(
            status ?? null
        );

        return res.status(200).json(targets);

    } catch (error) {
        next(error);
    }
};


// ========================================
// ADD NEW TARGET
// ========================================

const addTarget = async (req, res, next) => {
    try {
        const {
            name,
            url,
            interval_seconds = 60,
            threshold_ms = 1000
        } = req.body || {};

        // Validate target name
        if (
            typeof name !== "string" ||
            !name.trim() ||
            name.trim().length > 100
        ) {
            return res.status(400).json({
                message:
                    "Valid target name is required (max 100 characters)"
            });
        }

        // Validate URL
        let parsedUrl;

        try {
            parsedUrl = new URL(url);

            if (
                !["http:", "https:"].includes(parsedUrl.protocol)
            ) {
                throw new Error("Invalid protocol");
            }

            if (
                parsedUrl.username ||
                parsedUrl.password
            ) {
                throw new Error(
                    "Credentials are not allowed"
                );
            }

            if (
                parsedUrl.hostname.length > 100 ||
                url.length > 255
            ) {
                throw new Error("URL too long");
            }

        } catch {
            return res.status(400).json({
                message:
                    "Enter a valid HTTP or HTTPS URL"
            });
        }

        // Validate interval
        if (
            !Number.isInteger(interval_seconds) ||
            interval_seconds < 10
        ) {
            return res.status(400).json({
                message:
                    "Interval must be an integer of at least 10 seconds"
            });
        }

        // Validate threshold
        if (
            !Number.isInteger(threshold_ms) ||
            threshold_ms < 1
        ) {
            return res.status(400).json({
                message:
                    "Threshold must be a positive integer"
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

        return res.status(201).json({
            message: "Target added successfully",
            targetId
        });

    } catch (error) {
        next(error);
    }
};


// ========================================
// GET SINGLE TARGET
// ========================================

const getSingleTarget = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (
            !Number.isSafeInteger(id) ||
            id <= 0
        ) {
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

        return res.status(200).json(target);

    } catch (error) {
        next(error);
    }
};


// ========================================
// UPDATE TARGET
// ========================================

const editTarget = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (
            !Number.isSafeInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                message: "Invalid target ID"
            });
        }

        const existingTarget = await getTargetById(id);

        if (!existingTarget) {
            return res.status(404).json({
                message: "Target not found"
            });
        }

        const {
            name = existingTarget.name,
            url = existingTarget.url,
            interval_seconds = existingTarget.interval_seconds,
            threshold_ms = existingTarget.threshold_ms
        } = req.body || {};

        // Validate name
        if (
            typeof name !== "string" ||
            !name.trim() ||
            name.trim().length > 100
        ) {
            return res.status(400).json({
                message: "Valid target name is required"
            });
        }

        // Validate URL
        let parsedUrl;

        try {
            if (
                typeof url !== "string" ||
                url.length > 255
            ) {
                throw new Error("Invalid URL");
            }

            parsedUrl = new URL(url);

            if (
                !["http:", "https:"].includes(
                    parsedUrl.protocol
                ) ||
                parsedUrl.username ||
                parsedUrl.password ||
                parsedUrl.hostname.length > 100
            ) {
                throw new Error("Invalid URL");
            }

        } catch {
            return res.status(400).json({
                message:
                    "Enter a valid HTTP or HTTPS URL"
            });
        }

        // Validate interval
        if (
            !Number.isInteger(interval_seconds) ||
            interval_seconds < 10
        ) {
            return res.status(400).json({
                message:
                    "Interval must be at least 10 seconds"
            });
        }

        // Validate threshold
        if (
            !Number.isInteger(threshold_ms) ||
            threshold_ms < 1
        ) {
            return res.status(400).json({
                message:
                    "Threshold must be a positive integer"
            });
        }

        const host = parsedUrl.hostname.toLowerCase();

        await updateTarget(
            id,
            name.trim(),
            host,
            parsedUrl.href,
            interval_seconds,
            threshold_ms
        );

        return res.status(200).json({
            message: "Target updated successfully",
            targetId: id
        });

    } catch (error) {
        next(error);
    }
};


// ========================================
// ENABLE / DISABLE TARGET
// ========================================

const toggleTarget = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { enabled } = req.body || {};

        if (
            !Number.isSafeInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                message: "Invalid target ID"
            });
        }

        if (typeof enabled !== "boolean") {
            return res.status(400).json({
                message:
                    "enabled must be true or false"
            });
        }

        const existingTarget = await getTargetById(id);

        if (!existingTarget) {
            return res.status(404).json({
                message: "Target not found"
            });
        }

        const enabledValue = enabled ? 1 : 0;

        await setTargetEnabled(id, enabledValue);

        return res.status(200).json({
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


// ========================================
// DELETE TARGET
// ========================================

const removeTarget = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (
            !Number.isSafeInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                message: "Invalid target ID"
            });
        }

        const existingTarget = await getTargetById(id);

        if (!existingTarget) {
            return res.status(404).json({
                message: "Target not found"
            });
        }

        const deletedRows = await deleteTarget(id);

        if (deletedRows === 0) {
            return res.status(404).json({
                message: "Target not found"
            });
        }

        return res.status(200).json({
            message: "Target deleted successfully",
            targetId: id
        });

    } catch (error) {
        next(error);
    }
};


// ========================================
// MANUAL MONITORING CHECK
// Phase 8
// ========================================

const runTargetCheck = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (
            !Number.isSafeInteger(id) ||
            id <= 0
        ) {
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

        const checkData = await performTargetCheck(
            target
        );

        return res.status(200).json({
            message: "Monitoring check completed",
            ...checkData
        });

    } catch (error) {
        next(error);
    }
};


// ========================================
// EXPORT CONTROLLER FUNCTIONS
// ========================================


const getHistory = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        // Validate target ID
        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid target ID"
            });
        }

        // Validate history limit
        const limit = Number(req.query.limit ?? 50);

        if (
            !Number.isSafeInteger(limit) ||
            limit < 1 ||
            limit > 500
        ) {
            return res.status(400).json({
                message: "Limit must be between 1 and 500"
            });
        }

        // Check target exists
        const target = await getTargetById(id);

        if (!target) {
            return res.status(404).json({
                message: "Target not found"
            });
        }

        // Fetch monitoring history
        const history = await getTargetHistory(id, limit);

        return res.status(200).json({
            targetId: id,
            targetName: target.name,
            count: history.length,
            history
        });

    } catch (error) {
        next(error);
    }
};

const getAvailability = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const hours = Number(req.query.hours ?? 24);

    // Validate Target ID
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid target ID"
      });
    }

    // Supported periods: 1H, 24H, 7D
    if (![1, 24, 168].includes(hours)) {
      return res.status(400).json({
        message: "hours must be 1, 24, or 168"
      });
    }

    const target = await getTargetById(id);

    if (!target) {
      return res.status(404).json({
        message: "Target not found"
      });
    }

    const toDate = new Date();

    const fromDate = new Date(
      toDate.getTime() - hours * 60 * 60 * 1000
    );

    const result = await getTargetAvailability(
      id,
      fromDate,
      toDate
    );

    return res.status(200).json({
      targetId: id,
      targetName: target.name,
      periodHours: hours,
      ...result
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
    runTargetCheck,
    getHistory,
    getAvailability
};
