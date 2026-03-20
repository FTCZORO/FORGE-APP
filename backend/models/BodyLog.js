const mongoose = require("mongoose");

const bodyLogSchema = new mongoose.Schema({
  userId: { type: String, default: "default_user" },
  date: { type: Date, default: Date.now },
  weight: { type: Number },        // kg or lbs
  bodyFat: { type: Number },       // percentage
  chest: { type: Number },         // cm or inches
  waist: { type: Number },
  hips: { type: Number },
  arms: { type: Number },
  notes: { type: String, default: "" },
});

module.exports = mongoose.model("BodyLog", bodyLogSchema);
