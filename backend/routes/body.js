const express = require("express");
const router = express.Router();
const BodyLog = require("../models/BodyLog");

// GET all body logs
router.get("/", async (req, res) => {
  try {
    const logs = await BodyLog.find().sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new body log
router.post("/", async (req, res) => {
  try {
    const log = new BodyLog(req.body);
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a body log
router.delete("/:id", async (req, res) => {
  try {
    await BodyLog.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
