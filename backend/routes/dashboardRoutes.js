
const express = require("express");
const router = express.Router();

const {
    getSummary
} = require("../controllers/dashboardController");

// GET /api/dashboard/summary
router.get("/summary", getSummary);

module.exports = router;
