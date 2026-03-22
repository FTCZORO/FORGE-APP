const express = require("express");
const router = express.Router();
const Anthropic = require("@anthropic-ai/sdk");
const MacroLog = require("../models/MacroLog");
const WorkoutLog = require("../models/WorkoutLog");
const BodyLog = require("../models/BodyLog");
const auth = require("../middleware/auth");

const client = new Anthropic();

async function buildUserContext(userId) {
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
          `${e.name}${e.sets ? ` ${e.sets}x${e.reps}` : ""}${e.weight ? ` @ ${e.weight}lbs` : ""}${e.duration ? ` ${e.duration}min` : ""}`
        ).join(", ");
        return `  ${dateStr}: ${w.muscleGroup} — ${exList}`;
      }).join("\n")
    : "  No workouts logged this week.";

  const bodySummary = bodyLogs.length
    ? bodyLogs.map(b => {
        const dateStr = new Date(b.date).toDateString();
        const parts = [];
        if (b.weight) parts.push(`Weight: ${b.weight}lbs`);
        if (b.bodyFat) parts.push(`Body Fat: ${b.bodyFat}%`);
        if (b.waist) parts.push(`Waist: ${b.waist}in`);
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

router.post("/chat", auth, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const userContext = await buildUserContext(req.userId);

    const systemPrompt = `You are Forge Coach, a sharp personalized fitness and nutrition AI coach. Use American units always (lbs, inches, kcal). You have access to the user's real logged data below.

You can LOG macros and workouts directly when the user tells you what they ate or what workout they did.

When user describes food eaten, estimate macros and add this EXACTLY at the end of your response:
<log_macros>
{"calories": 000, "protein": 00, "carbs": 00, "fat": 00, "notes": "description"}
</log_macros>

When user describes a workout they did, add this EXACTLY at the end of your response:
<log_workout>
{"muscleGroup": "Chest", "exercises": [{"name": "Bench Press", "sets": 4, "reps": 8, "weight": 185}], "notes": ""}
</log_workout>

Only include log blocks when user is clearly describing food they ate or a workout they did. NOT for questions or analysis.

Be direct, data-driven, encouraging but honest. Keep responses concise.

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

    let reply = response.content[0].text;

    // Auto-log macros if AI detected food
    const macroMatch = reply.match(/<log_macros>([\s\S]*?)<\/log_macros>/);
    if (macroMatch) {
      try {
        const macroData = JSON.parse(macroMatch[1].trim());
        await MacroLog.create({
          userId: req.userId,
          date: new Date(),
          calories: macroData.calories || 0,
          protein: macroData.protein || 0,
          carbs: macroData.carbs || 0,
          fat: macroData.fat || 0,
          notes: macroData.notes || "Logged via AI Coach",
        });
        reply = reply.replace(/<log_macros>[\s\S]*?<\/log_macros>/, '').trim();
        reply += '\n\n✅ Macros logged automatically!';
      } catch (e) {
        console.error("Failed to log macros:", e);
      }
    }

    // Auto-log workout if AI detected one
    const workoutMatch = reply.match(/<log_workout>([\s\S]*?)<\/log_workout>/);
    if (workoutMatch) {
      try {
        const workoutData = JSON.parse(workoutMatch[1].trim());
        await WorkoutLog.create({
          userId: req.userId,
          date: new Date(),
          muscleGroup: workoutData.muscleGroup || "General",
          exercises: workoutData.exercises || [],
          notes: workoutData.notes || "Logged via AI Coach",
        });
        reply = reply.replace(/<log_workout>[\s\S]*?<\/log_workout>/, '').trim();
        reply += '\n\n✅ Workout logged automatically!';
      } catch (e) {
        console.error("Failed to log workout:", e);
      }
    }

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
