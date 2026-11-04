
const {
    getAllEvents
} = require("../models/eventModel");

const getEvents = async (req, res, next) => {
    try {
        const {
            severity,
            resolved,
            limit
        } = req.query;

        // Validate severity
        // Keep severity values consistent with database schema.
        if (
            severity !== undefined &&
            (
                typeof severity !== "string" ||
                !/^[A-Za-z_]{1,30}$/.test(severity)
            )
        ) {
            return res.status(400).json({
                message: "Invalid severity value"
            });
        }

        // Validate resolved filter
        if (
            resolved !== undefined &&
            resolved !== "true" &&
            resolved !== "false"
        ) {
            return res.status(400).json({
                message: "resolved must be true or false"
            });
        }

        // Validate result limit
        const parsedLimit = limit === undefined
            ? 50
            : Number(limit);

        if (
            !Number.isSafeInteger(parsedLimit) ||
            parsedLimit < 1 ||
            parsedLimit > 500
        ) {
            return res.status(400).json({
                message: "limit must be between 1 and 500"
            });
        }

        // Convert query string to boolean
        const resolvedFilter = resolved === undefined
            ? null
            : resolved === "true";

        // Fetch events from MySQL
        const events = await getAllEvents(
            severity ?? null,
            resolvedFilter,
            parsedLimit
        );

        return res.status(200).json({
            count: events.length,
            events
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getEvents
};
