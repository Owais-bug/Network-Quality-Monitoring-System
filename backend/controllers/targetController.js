const { getAllTargets , createTarget } = require("../models/targetModel");

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

module.exports = { getTargets , addTarget };