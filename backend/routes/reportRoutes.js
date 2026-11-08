
const express = require("express");
const router = express.Router();

const {
  exportChecksCsv
} = require("../controllers/reportController");

// Export monitoring history as CSV
router.get("/checks.csv", exportChecksCsv);

module.exports = router;
