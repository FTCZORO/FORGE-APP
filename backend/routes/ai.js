const express = require("express");
const router = express.Router();
const Anthropic = require("@anthropic-ai/sdk");
const MacroLog = require("../models/MacroLog");
const WorkoutLog = require("../models/WorkoutLog");
const BodyLog = require("../models/BodyLog");

const client = new Anthropic();

// Build a weekly summary string from DB data
async function buildUserContext(userId = "default_user") {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const macros = await MacroLog.find({ userId, date: { $gte: sevenDaysAgo } }).sort({ date: 1 });
  const workouts = await WorkoutLog.find({ userId, date: { $gte: sevenDaysAgo } }).sort({ date: 1 });
  const bodyLogs = await BodyLog.find({ userId }).sort({ date: -1 }).limit(2);

  const macroSummary = macros.length
    ? macros.map(d => {
        const dateStr = new Date(d.date).toDateString();
        return `  ${dateStr}: ${d.calories} kcal | Protein: ${d.protein}g | Carbs: ${d.carbs}g | Fat: ${d.fat}g${d.notes ? ` (note: ${d.notes})` : ""}`;
      }).join("\n")
    : "  No macro data logged this week.";

  const workoutSummary = workouts.length
    ? workouts.map(w => {
        const dateStr = new Date(w.date).toDateString();
        const exList = w.exercises.map(e =>
          `${e.name}${e.sets ? ` ${e.sets}x${e.reps}` : ""}${e.weight ? ` @ ${e.weight}kg` : ""}${e.duration ? ` ${e.duration}min` : ""}`
        ).join(", ");
        return `  ${dateStr}: ${w.muscleGroup} — ${exList}`;
      }).join("\n")
    : "  No workouts logged this week.";

  const bodySummary = bodyLogs.length
    ? bodyLogs.map(b => {
        const dateStr = new Date(b.date).toDateString();
        const parts = [];
        if (b.weight) parts.push(`Weight: ${b.weight}kg`);
        if (b.bodyFat) parts.push(`Body Fat: ${b.bodyFat}%`);
        if (b.waist) parts.push(`Waist: ${b.waist}cm`);
        return `  ${dateStr}: ${parts.join(" | ")}`;
      }).join("\n")
    : "  No body measurements logged yet.";

  return `
=== USER'S DATA (Last 7 Days) ===

MACRO LOGS:
${macroSummary}

WORKOUT LOGS:
${workoutSummary}

BODY MEASUREMENTS (most recent):
${bodySummary}
=================================
`;
}

// POST /api/ai/chat
router.post("/chat", async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    const userContext = await buildUserContext();

    const systemPrompt = `You are FitAI, a sharp and personalized fitness and nutrition coach. You have access to the user's real logged data below. Use it to give specific, data-driven advice — not generic tips.

When analyzing trends:
- Point out specific days where macros were off and why it matters
- Notice patterns like skipped workouts or consecutive training days without rest
- Compare their current stats to what's typical for their apparent goals
- Be encouraging but direct — don't sugarcoat, but don't be harsh

Keep responses concise and actionable. Use bullet points when listing multiple insights.

${userContext}`;

    const messages = [
      ...conversationHistory,
      { role: "user", content: message },
    ];

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const reply = response.content[0].text;

    res.json({
      reply,
      updatedHistory: [...messages, { role: "assistant", content: reply }],
    });
  } catch (err) {
    console.error("AI error:", err);
    res.status(500).json({ error: "AI request failed: " + err.message });
  }
});

module.exports = router;
