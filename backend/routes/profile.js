const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.userId });
    if (!profile) profile = await Profile.create({ userId: req.userId });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/", auth, async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { ...req.body },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
