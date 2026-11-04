
const {
    getDashboardSummary
} = require("../models/dashboardModel");

const {
    getAllEvents
} = require("../models/eventModel");

const getSummary = async (req, res, next) => {
    try {
        // Get dashboard statistics from MySQL
        const summary = await getDashboardSummary();

        // Get latest 5 monitoring events
        const recentEvents = await getAllEvents(
            null,
            null,
            5
        );

        // Return JSON response
        return res.status(200).json({
            message: "Dashboard summary fetched successfully",
            summary,
            recentEvents
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSummary
};
