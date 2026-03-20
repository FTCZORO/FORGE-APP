const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number },
  reps: { type: Number },
  weight: { type: Number }, // kg or lbs
  duration: { type: Number }, // minutes (for cardio)
});

const workoutLogSchema = new mongoose.Schema({
  userId: { type: String, default: "default_user" },
  date: { type: Date, default: Date.now },
  muscleGroup: { type: String, required: true }, // e.g. "Chest", "Legs", "Full Body"
  exercises: [exerciseSchema],
  notes: { type: String, default: "" },
});

module.exports = mongoose.model("WorkoutLog", workoutLogSchema);
