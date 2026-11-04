const express = require("express");
const router = express.Router();

const {
    getTargets,
    addTarget,
    getSingleTarget,
    editTarget,
    toggleTarget,
    removeTarget,
    runTargetCheck,
    getHistory
} = require("../controllers/targetController");




router.get("/", getTargets);
router.post("/", addTarget);
router.get("/:id", getSingleTarget);
router.patch("/:id", editTarget);
router.patch("/:id/enabled", toggleTarget);
router.delete("/:id", removeTarget);
router.post("/:id/check", runTargetCheck);
router.get("/:id/history", getHistory);

module.exports = router;