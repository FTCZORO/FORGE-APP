const mongoose = require("mongoose");

const macroLogSchema = new mongoose.Schema({
  userId: { type: String, default: "default_user" }, // swap for real auth later
  date: { type: Date, default: Date.now },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },  // grams
  carbs: { type: Number, required: true },    // grams
  fat: { type: Number, required: true },      // grams
  notes: { type: String, default: "" },
});

module.exports = mongoose.model("MacroLog", macroLogSchema);
