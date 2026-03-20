# FitAI — Macro & Workout Tracker with AI Coach

## Project Structure
```
fitai/
├── backend/
│   ├── models/
│   │   ├── MacroLog.js
│   │   ├── WorkoutLog.js
│   │   └── BodyLog.js
│   ├── routes/
│   │   ├── macros.js
│   │   ├── workouts.js
│   │   ├── body.js
│   │   └── ai.js          ← Claude AI integration
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    └── index.html
```

## Setup Instructions

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```
Edit `.env` and fill in:
- `ANTHROPIC_API_KEY` → Get from https://console.anthropic.com
- `MONGODB_URI` → Your MongoDB connection string (local or MongoDB Atlas)

### 3. Start MongoDB
- **Local**: Make sure MongoDB is running (`mongod`)
- **Cloud**: Use MongoDB Atlas (free tier) — paste the connection string into `.env`

### 4. Run the server
```bash
npm run dev    # development (auto-restarts)
npm start      # production
```

### 5. Open the app
Visit: http://localhost:3000

---

## Features
- **Macros** — Log daily calories, protein, carbs, fat
- **Workouts** — Log exercises with sets, reps, weight
- **Body** — Track weight, body fat %, and measurements
- **Dashboard** — Overview of today's data + recent logs
- **AI Coach** — Chat with Claude, who reads your actual data and gives personalized advice

## Next Steps
- Add user authentication (JWT)
- Add charts/graphs for trends
- Add macro goals/targets
- Mobile app (React Native)
