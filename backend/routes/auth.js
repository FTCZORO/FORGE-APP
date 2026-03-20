const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// SIGN UP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already in use" });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({ name, email, password: hashed });
    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOG IN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid email or password" });

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
