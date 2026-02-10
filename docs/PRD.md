# Stride — Product Requirements Document

## Vision

Stride is the running app for runners who are tired of juggling multiple apps. It combines the social shareability of Strava, the clean simplicity of Final Surge, and AI-powered training plans that adapt to you — not pre-built templates.

## Problem

Runners currently need multiple apps:
- **Strava** — great social features but bloated UI, no real training plans
- **Runna** — has training plans but they're pre-defined templates, not personalized
- **Final Surge** — clean UI and good logging but lacks AI and social features

No single app does all three well.

## Target User

Recreational to intermediate runners who:
- Train for specific race goals (5K to marathon)
- Want a structured plan without hiring a coach
- Want to share their progress with friends
- Value simplicity over feature overload
- Train 3-6 days per week

## V1 Core Features

### 1. AI Training Plan Generator (Primary Feature)

The core differentiator. The AI builds a fully personalized, periodized training plan.

**Inputs:**
- Goal race distance (5K, 10K, half marathon, marathon)
- Target time (A goal + B goal)
- Race date
- Current fitness: recent race times, current weekly mileage
- Experience level (beginner, intermediate, advanced)
- Available training days per week (3-7)
- Preferred long run day
- Injury notes / things to watch

**Outputs:**
- Full periodized plan: Base → Build → Peak → Taper
- Weekly structure with specific workouts
- Target paces for each workout type
- Recovery weeks built in (every 3-4 weeks)

**Weekly Review & Adjust:**
- User logs actual runs throughout the week
- At end of week, user can trigger "Review My Week"
- AI compares planned vs actual, analyzes trends
- AI suggests adjustments to upcoming weeks
- User approves or modifies suggestions

### 2. Training Calendar & Log

**Calendar View (Final Surge inspired):**
- Monthly/weekly calendar showing planned workouts
- Color-coded by workout type (easy = green, tempo = orange, intervals = red, long = blue, rest = gray)
- Visual planned vs completed overlay
- Click into any day to see workout details or log a run

**Manual Run Logging:**
- Date, distance (km), duration, average pace (auto-calculated)
- Effort level (1-10 scale)
- Workout type (easy, tempo, interval, long run, race, other)
- Notes (free text)
- Link to planned workout (if applicable)

**Weekly/Monthly Summaries:**
- Total distance, total time
- Number of runs
- Planned vs actual comparison
- Trend charts (weekly mileage over time)

### 3. Social Sharing

**Shareable Run Cards:**
- Auto-generated image cards with run stats
- Clean, branded design (not generic)
- Includes: distance, pace, duration, effort, date
- Downloadable as image for sharing on Instagram/WhatsApp/etc.

**AI Run Recaps:**
- After logging a run, AI generates a short personalized recap
- References the specific workout, how it compared to plan
- Encouraging, insightful, coach-like tone
- Example: "Solid tempo effort. You held 6:15/km for 8K — that's 10s faster than two weeks ago. The half marathon fitness is building."

**Training Plan Progress Cards:**
- Shareable card showing where you are in your plan
- Week X of Y, phase name, weekly mileage, goal race
- Example: "Week 8/16 — Build Phase | 35km this week | HM: June 7"

**Streak & Milestone Cards:**
- Auto-detected streaks (consecutive weeks hitting plan)
- Milestones: 100km month, longest run, new PR
- Shareable as image cards

### 4. Dashboard

- Current week overview (today's workout highlighted)
- Upcoming workouts (next 3 days)
- Training plan progress bar
- Current streak
- Weekly mileage chart (last 8 weeks)
- Quick-log button

### 5. User Profile & Auth

- Email/password registration and login
- Runner profile setup (onboarding flow):
  - Name, experience level
  - Current weekly mileage
  - Race history (recent times)
  - Available training days
  - Preferred long run day
  - Injury notes

## V2+ Features (Not in V1)

- GPS watch integration (Garmin, Apple Watch, COROS via Strava API)
- In-app social feed (follow runners, kudos, comments)
- Auto-adaptive plans (AI proactively suggests changes without user triggering)
- Race predictions based on training data
- Group challenges (monthly distance goals)
- Route tracking / map view
- Heart rate zone training integration
- Nutrition / hydration tracking
- Multi-race planning (back-to-back race seasons)

## Design Principles

1. **Simple over feature-rich** — if in doubt, leave it out
2. **Coach-like, not robot-like** — AI should feel like a knowledgeable friend
3. **Glanceable** — key info visible without digging
4. **Share-worthy** — everything that can be shared should look beautiful
5. **Mobile-first** — designed for phone screens, works on desktop too

## Success Metrics (V1)

- User can generate a training plan in under 2 minutes
- User can log a run in under 30 seconds
- AI training plans pass review by experienced runners (quality check)
- Share cards look professional enough to post publicly
- App loads in under 2 seconds on mobile
