const express = require("express");
const router = express.Router();
const MacroLog = require("../models/MacroLog");

// GET all macro logs (last 30 days)
router.get("/", async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const logs = await MacroLog.find({ date: { $gte: thirtyDaysAgo } }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new macro log
router.post("/", async (req, res) => {
  try {
    const log = new MacroLog(req.body);
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a macro log
router.delete("/:id", async (req, res) => {
  try {
    await MacroLog.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
