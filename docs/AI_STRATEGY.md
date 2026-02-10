# Stride — AI Strategy

## Overview

Stride uses Claude (Anthropic) for three AI-powered features:
1. **Training Plan Generation** — the core feature
2. **Weekly Review & Adjustment** — adaptive coaching
3. **Run Recaps** — post-run personalized commentary

All AI interactions are server-side (Rails backend → Claude API). The frontend never calls the AI directly.

## Model Selection

| Feature              | Model           | Reasoning                                    |
| -------------------- | --------------- | -------------------------------------------- |
| Plan Generation      | Claude Sonnet 4.5 | Structured output, good reasoning, cost-effective |
| Weekly Review        | Claude Sonnet 4.5 | Analysis + suggestions, moderate complexity   |
| Run Recaps           | Claude Haiku 4.5  | Short text, fast, very cheap                  |

## 1. Training Plan Generation

### Input Data

Collected from user profile and plan creation form:

```json
{
  "runner": {
    "name": "Leo",
    "experience_level": "intermediate",
    "current_weekly_km": 28,
    "available_days_per_week": 3,
    "preferred_long_run_day": "sunday",
    "injury_notes": null
  },
  "race_history": [
    { "distance_km": 10, "time_secs": 4020, "date": "2025-12-01" },
    { "distance_km": 21.1, "time_secs": 7800, "date": "2025-10-15" }
  ],
  "goal": {
    "distance_km": 21.1,
    "target_time_secs": 7200,
    "target_time_b_secs": 7500,
    "race_date": "2026-06-07"
  },
  "plan_start_date": "2026-02-10",
  "total_weeks": 17
}
```

### Pace Calculation (Pre-AI)

Before calling the AI, we calculate training paces using the runner's race history. This gives the AI concrete numbers to work with.

**Based on 10K time of 1:07:00 (6:42/km):**

| Zone          | Pace/km   | Purpose                        |
| ------------- | --------- | ------------------------------ |
| Easy          | 7:20-7:50 | Aerobic base, recovery         |
| Long Run      | 7:00-7:30 | Endurance, fat adaptation      |
| Tempo         | 6:10-6:25 | Lactate threshold              |
| Race Pace (HM)| 5:41      | Goal pace (for sub-2:00)      |
| Interval      | 5:30-5:50 | VO2max development             |
| Recovery      | 7:50-8:20 | Active recovery                |

**Calculation method:**
- Use Jack Daniels' VDOT equivalent tables (or simplified formulas)
- Input: best recent race performance
- Output: training paces for each zone
- Implemented in `PaceCalculator` service (Ruby, no AI needed)

### Prompt Template

```
You are an expert running coach creating a personalized training plan.

## Runner Profile
- Experience: {experience_level}
- Current weekly volume: {current_weekly_km} km/week
- Available training days: {available_days_per_week} days/week
- Preferred long run day: {preferred_long_run_day}
- Injury considerations: {injury_notes || "None"}

## Race History
{race_history_formatted}

## Goal
- Race: {distance_km}km ({race_name})
- A Goal: {target_time_a}
- B Goal: {target_time_b}
- Race Date: {race_date}
- Plan Duration: {total_weeks} weeks (starting {start_date})

## Training Paces (calculated from current fitness)
{pace_zones_formatted}

## Requirements
Create a {total_weeks}-week periodized training plan following these principles:

1. **Periodization**: Divide into phases:
   - Base (weeks 1-{base_end}): Build aerobic foundation, increase volume gradually
   - Build (weeks {build_start}-{build_end}): Introduce and progress speed work
   - Peak (weeks {peak_start}-{peak_end}): Race-specific workouts, highest intensity
   - Taper (final 2-3 weeks): Reduce volume 40-60%, maintain some intensity

2. **Weekly structure** for {available_days_per_week} days:
   - Always include one long run on {preferred_long_run_day}
   - At least one easy/recovery run
   - One quality session (tempo, intervals, or race pace) in build/peak phases
   - Rest days between hard efforts

3. **Progressive overload**:
   - Increase weekly volume no more than 10% per week
   - Recovery week every 3-4 weeks (reduce volume 20-30%)
   - Long run increases gradually (max 2km per week)

4. **Race-specific preparation**:
   - Tempo runs progress toward race pace and race duration
   - Include a tune-up race or time trial 3-4 weeks out
   - Final long run of race distance (or close) 3 weeks before race

## Output Format

Return a JSON object with this exact structure:
{
  "weeks": [
    {
      "week_number": 1,
      "phase": "base",
      "target_distance_km": 25,
      "focus": "Easy aerobic base building",
      "notes": "Focus on comfortable effort. Build the habit.",
      "workouts": [
        {
          "day_of_week": "tuesday",
          "workout_type": "easy",
          "title": "Easy Run",
          "description": "Run at an easy, conversational pace. Don't worry about speed — just get the miles in.",
          "distance_km": 7,
          "duration_mins": 52,
          "target_pace_range": "7:20-7:50/km"
        }
      ]
    }
  ]
}

Rules for the JSON:
- day_of_week must be lowercase: monday, tuesday, wednesday, thursday, friday, saturday, sunday
- workout_type must be one of: rest, easy, recovery, tempo, interval, long_run, race_pace, fartlek, hill_repeats, cross_training, race
- description should be practical coaching instructions (2-3 sentences)
- Include rest days in the workout list
- distance_km should be null for rest days
- Return ONLY the JSON, no additional text
```

### Response Parsing

1. Parse JSON response from Claude
2. Validate structure (all required fields present)
3. Validate constraints (distances reasonable, paces make sense)
4. Create TrainingPlan, TrainingWeek, and PlannedWorkout records
5. If parsing fails, retry once with a correction prompt
6. If retry fails, return error to user

### Edge Cases

- **Very short plans (< 8 weeks)**: Skip base phase, focus on build + taper
- **Very long plans (> 20 weeks)**: Extended base phase
- **Beginner runners**: Emphasize run/walk intervals, lower volume
- **3 days/week**: Every run matters — one easy, one quality, one long
- **6-7 days/week**: Add doubles, recovery runs, cross-training

---

## 2. Weekly Review & Adjustment

### When Triggered

User clicks "Review My Week" after completing (or partially completing) a training week.

### Input Data

```json
{
  "runner_profile": { ... },
  "plan_context": {
    "goal": "HM sub-2:00, June 7",
    "current_week": 5,
    "total_weeks": 17,
    "phase": "build"
  },
  "planned_workouts": [
    {
      "day": "tuesday",
      "type": "easy",
      "title": "Easy Run",
      "distance_km": 8,
      "target_pace": "7:20-7:50/km"
    },
    {
      "day": "thursday",
      "type": "tempo",
      "title": "Tempo Run",
      "distance_km": 8,
      "target_pace": "6:10-6:25/km"
    },
    {
      "day": "sunday",
      "type": "long_run",
      "title": "Long Run",
      "distance_km": 14,
      "target_pace": "7:00-7:30/km"
    }
  ],
  "actual_runs": [
    {
      "date": "2026-03-10",
      "distance_km": 8.2,
      "duration_secs": 2952,
      "pace": "6:00/km",
      "effort": 5,
      "notes": "Felt easy"
    },
    {
      "date": "2026-03-15",
      "distance_km": 14.5,
      "duration_secs": 6090,
      "pace": "7:00/km",
      "effort": 7,
      "notes": "Last 3km were tough"
    }
  ],
  "user_notes": "Skipped Thursday tempo, felt really tired after work",
  "recent_weeks_summary": [
    { "week": 3, "compliance": 100, "planned_km": 28, "actual_km": 29 },
    { "week": 4, "compliance": 100, "planned_km": 30, "actual_km": 31 }
  ]
}
```

### Prompt Template

```
You are an expert running coach reviewing a runner's training week.

## Context
{plan_context}

## This Week: Planned vs Actual
{planned_vs_actual_formatted}

## Runner's Notes
"{user_notes}"

## Recent Trend
{recent_weeks_summary}

## Analysis Instructions

Provide:
1. **Summary** (2-3 sentences): How did the week go overall?
2. **Observations** (bullet points): What went well, what's concerning
3. **Adjustments** (if needed): Specific changes to upcoming 1-2 weeks

Be honest but encouraging. Flag if:
- Runner is running easy days too fast (common mistake)
- Volume dropped significantly
- Signs of overtraining (declining performance + high effort)
- Missed key workouts (tempo/long runs matter more than easy runs)

Return JSON:
{
  "summary": "...",
  "observations": ["...", "..."],
  "adjustments": [
    {
      "week_number": 6,
      "workout_changes": [
        {
          "day_of_week": "thursday",
          "original": "8km tempo at 6:10-6:25/km",
          "suggested": "6km tempo at 6:20-6:30/km",
          "reason": "Easing back into tempo after missed session"
        }
      ]
    }
  ],
  "encouragement": "..."
}
```

---

## 3. Run Recaps

### When Triggered

On-demand — user views a run and clicks "Get Recap" (or auto-generated when viewing run detail).

### Input Data

```json
{
  "run": {
    "date": "2026-03-10",
    "distance_km": 8.2,
    "duration_secs": 2952,
    "pace": "6:00/km",
    "effort": 5,
    "type": "easy",
    "notes": "Felt easy"
  },
  "planned_workout": {
    "type": "easy",
    "distance_km": 8,
    "target_pace": "7:20-7:50/km"
  },
  "context": {
    "plan": "HM Sub-2:00",
    "week": 5,
    "total_weeks": 17,
    "phase": "build",
    "last_3_runs": [ ... ]
  }
}
```

### Prompt Template

```
You are a running coach giving brief post-run feedback. Be conversational, specific, and helpful. 2-3 sentences max.

Run: {distance_km}km in {duration} ({pace}/km), effort {effort}/10
Planned: {planned_type} — {planned_distance}km at {planned_pace}
Context: Week {week}/{total_weeks} of {plan_name} ({phase} phase)
Runner's notes: "{notes}"

Give a short, personalized recap. Reference specific numbers. If the runner ran their easy day too fast, gently mention it. If they nailed a workout, celebrate it. Be a coach, not a cheerleader.
```

### Example Outputs

**Easy run done too fast:**
> "8.2km at 6:00/km — solid distance but that's well under your easy pace target of 7:20-7:50. Easy days build your aerobic base, but only if they're actually easy. Try slowing down next Tuesday. Your legs will thank you on tempo day."

**Great tempo run:**
> "Crushed the tempo. 8km at 6:15/km is right in the sweet spot, and you held it consistent throughout. That's half marathon fitness showing up. Week 5 of 17 — you're ahead of schedule."

**Missed workout acknowledged:**
> "Good call skipping the tempo when you were fatigued. One missed workout won't derail 17 weeks of training, but chronic fatigue would. The long run on Sunday looked strong. You're on track."

---

## Cost Estimates

| Feature         | Model      | ~Tokens In | ~Tokens Out | Cost/Call   |
| --------------- | ---------- | ---------- | ----------- | ----------- |
| Plan Generation | Sonnet 4.5 | ~2,000     | ~4,000      | ~$0.04      |
| Weekly Review   | Sonnet 4.5 | ~1,500     | ~800        | ~$0.01      |
| Run Recap       | Haiku 4.5  | ~500       | ~100        | ~$0.0003    |

**Monthly estimate per active user:**
- 1 plan generation: $0.04
- 4 weekly reviews: $0.04
- 12 run recaps: $0.004
- **Total: ~$0.08/user/month**

---

## Implementation Notes

### Service Object Structure

```ruby
# app/services/ai/training_plan_generator.rb
class Ai::TrainingPlanGenerator
  def initialize(user:, plan_params:)
    @user = user
    @plan_params = plan_params
    @pace_calculator = PaceCalculator.new(user.race_histories)
  end

  def generate
    paces = @pace_calculator.calculate_zones
    prompt = build_prompt(paces)
    response = call_claude(prompt)
    plan_data = parse_response(response)
    create_plan_records(plan_data)
  end

  private

  def build_prompt(paces)
    # Interpolate template with user data + calculated paces
  end

  def call_claude(prompt)
    # Anthropic API call with structured output
  end

  def parse_response(response)
    # JSON parse + validation
  end

  def create_plan_records(data)
    # ActiveRecord transaction: Plan → Weeks → Workouts
  end
end
```

### Error Handling

1. **API timeout**: Retry once, then return "Plan generation is taking longer than expected. Try again."
2. **Invalid JSON response**: Retry with correction prompt
3. **Rate limit**: Queue and retry with exponential backoff
4. **Bad plan quality**: Validate distances and paces are within reasonable ranges

### Caching Strategy

- Generated plans: persisted in DB, never regenerated
- Weekly reviews: persisted in DB, one per week
- Run recaps: persisted in DB, one per run
- No repeated AI calls for the same data
