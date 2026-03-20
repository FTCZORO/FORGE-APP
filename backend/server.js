require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/macros", require("./routes/macros"));
app.use("/api/workouts", require("./routes/workouts"));
app.use("/api/body", require("./routes/body"));
app.use("/api/ai", require("./routes/ai"));

// Serve auth page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/auth.html"));
});

// Catch-all: serve frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
