const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, default: "" },
  goal: { type: String, enum: ["bulk", "cut", "maintain"], default: "maintain" },
  targetCalories: { type: Number, default: 2500 },
  targetProtein: { type: Number, default: 180 },
  targetCarbs: { type: Number, default: 250 },
  targetFat: { type: Number, default: 80 },
  activityLevel: { type: String, enum: ["sedentary", "light", "moderate", "active", "very_active"], default: "moderate" },
  age: { type: Number },
  height: { type: Number },
  onboardingComplete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Profile", profileSchema);
