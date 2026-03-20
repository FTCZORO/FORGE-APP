const express = require("express");
const router = express.Router();
const WorkoutLog = require("../models/WorkoutLog");

// GET all workout logs (last 30 days)
router.get("/", async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const logs = await WorkoutLog.find({ date: { $gte: thirtyDaysAgo } }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new workout log
router.post("/", async (req, res) => {
  try {
    const log = new WorkoutLog(req.body);
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a workout log
router.delete("/:id", async (req, res) => {
  try {
    await WorkoutLog.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
