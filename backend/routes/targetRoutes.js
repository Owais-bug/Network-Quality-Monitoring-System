const express = require("express");
const router = express.Router();

const { getTargets, addTarget } = require("../controllers/targetController");

router.get("/", getTargets);
router.post("/", addTarget);

module.exports = router;