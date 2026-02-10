# Stride — API Specification

Base URL: `/api/v1`

All responses are JSON. All authenticated endpoints require `Authorization: Bearer <token>` header.

---

## Authentication

### POST /auth/signup

Create a new account.

**Request:**
```json
{
  "user": {
    "email": "runner@example.com",
    "password": "securepassword",
    "password_confirmation": "securepassword",
    "name": "Leo"
  }
}
```

**Response (201):**
```json
{
  "user": { "id": 1, "email": "runner@example.com", "name": "Leo" },
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### POST /auth/login

**Request:**
```json
{
  "user": {
    "email": "runner@example.com",
    "password": "securepassword"
  }
}
```

**Response (200):** Same as signup response.

### DELETE /auth/logout

Invalidates current token. Requires auth.

**Response (200):**
```json
{ "message": "Logged out successfully" }
```

### GET /auth/me

Returns current user. Requires auth.

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "runner@example.com",
    "name": "Leo",
    "has_profile": true,
    "has_active_plan": true
  }
}
```

---

## Runner Profile

### GET /profile

Get current user's runner profile.

**Response (200):**
```json
{
  "profile": {
    "id": 1,
    "experience_level": "intermediate",
    "current_weekly_km": 28,
    "available_days": 3,
    "preferred_long_run_day": "sunday",
    "injury_notes": null
  },
  "race_histories": [
    {
      "id": 1,
      "race_name": "Local 10K",
      "distance_km": 10,
      "finish_time": "1:07:00",
      "finish_time_secs": 4020,
      "race_date": "2025-12-01"
    }
  ]
}
```

### PUT /profile

Update runner profile.

**Request:**
```json
{
  "profile": {
    "experience_level": "intermediate",
    "current_weekly_km": 30,
    "available_days": 4,
    "preferred_long_run_day": "sunday",
    "injury_notes": "Mild left knee stiffness"
  }
}
```

### POST /profile/race_histories

Add a race result.

**Request:**
```json
{
  "race_history": {
    "race_name": "City Half Marathon",
    "distance_km": 21.1,
    "finish_time_secs": 7800,
    "race_date": "2025-11-15"
  }
}
```

### DELETE /profile/race_histories/:id

Remove a race history entry.

---

## Training Plans

### POST /training_plans/generate

Generate a new AI training plan. Requires profile to be completed.

**Request:**
```json
{
  "training_plan": {
    "goal_distance_km": 21.1,
    "goal_time_secs": 7200,
    "goal_time_b_secs": 7500,
    "race_date": "2026-06-07",
    "name": "HM Sub-2:00"
  }
}
```

**Response (201):**
```json
{
  "training_plan": {
    "id": 1,
    "name": "HM Sub-2:00",
    "goal_distance_km": 21.1,
    "goal_time": "2:00:00",
    "goal_time_b": "2:05:00",
    "race_date": "2026-06-07",
    "start_date": "2026-02-10",
    "end_date": "2026-06-07",
    "total_weeks": 17,
    "status": "active",
    "weeks": [
      {
        "id": 1,
        "week_number": 1,
        "phase": "base",
        "target_distance_km": 25,
        "focus": "Easy aerobic base building",
        "start_date": "2026-02-10",
        "end_date": "2026-02-16",
        "workouts": [
          {
            "id": 1,
            "day_of_week": "tuesday",
            "scheduled_date": "2026-02-10",
            "workout_type": "easy",
            "title": "Easy Run",
            "description": "Easy effort run. Keep it conversational.",
            "distance_km": 6,
            "target_pace_range": "7:20-7:50",
            "status": "pending"
          }
        ]
      }
    ]
  }
}
```

### GET /training_plans

List user's training plans.

**Query params:** `?status=active` (optional filter)

**Response (200):**
```json
{
  "training_plans": [
    {
      "id": 1,
      "name": "HM Sub-2:00",
      "goal_distance_km": 21.1,
      "goal_time": "2:00:00",
      "race_date": "2026-06-07",
      "total_weeks": 17,
      "current_week": 3,
      "status": "active"
    }
  ]
}
```

### GET /training_plans/:id

Get full training plan with all weeks and workouts.

### DELETE /training_plans/:id

Cancel a training plan (sets status to cancelled).

---

## Training Weeks

### GET /training_weeks/:id

Get a specific week with workouts and completion data.

**Response (200):**
```json
{
  "training_week": {
    "id": 5,
    "week_number": 5,
    "phase": "build",
    "target_distance_km": 32,
    "focus": "Introducing tempo work",
    "status": "current",
    "workouts": [ ... ],
    "summary": {
      "planned_km": 32,
      "actual_km": 28.5,
      "workouts_completed": 2,
      "workouts_total": 3,
      "compliance_pct": 67
    }
  }
}
```

### POST /training_weeks/:id/review

Trigger AI weekly review.

**Request:**
```json
{
  "user_notes": "Felt tired on Thursday, skipped the tempo run"
}
```

**Response (200):**
```json
{
  "review": {
    "id": 1,
    "compliance_pct": 67,
    "total_actual_km": 28.5,
    "total_planned_km": 32,
    "ai_analysis": "You completed 2 of 3 planned runs this week (67%). Missing the tempo run is okay — listening to fatigue is smart. Your easy runs were at good paces. For next week, I'd suggest...",
    "ai_adjustments": {
      "weeks_affected": [6, 7],
      "changes": [
        {
          "week": 6,
          "change": "Reduced tempo distance from 8km to 6km",
          "reason": "Easing back into tempo work after missed session"
        }
      ]
    },
    "adjustments_applied": false
  }
}
```

### POST /training_weeks/:id/review/apply

Apply the AI-suggested adjustments to upcoming weeks.

---

## Activity Logs

### POST /activity_logs

Log a completed run.

**Request:**
```json
{
  "activity_log": {
    "planned_workout_id": 15,
    "date": "2026-03-01",
    "distance_km": 8.2,
    "duration_secs": 2952,
    "effort_level": 6,
    "workout_type": "easy",
    "notes": "Felt good, legs were fresh"
  }
}
```

**Response (201):**
```json
{
  "activity_log": {
    "id": 1,
    "date": "2026-03-01",
    "distance_km": 8.2,
    "duration_secs": 2952,
    "duration": "49:12",
    "avg_pace_secs": 360,
    "avg_pace": "6:00/km",
    "effort_level": 6,
    "workout_type": "easy",
    "notes": "Felt good, legs were fresh",
    "planned_workout": {
      "title": "Easy Run",
      "distance_km": 8,
      "target_pace_range": "7:20-7:50"
    }
  }
}
```

### GET /activity_logs

List user's activity logs.

**Query params:**
- `?from=2026-02-01&to=2026-02-28` — date range filter
- `?page=1&per_page=20` — pagination

### GET /activity_logs/:id

Get single activity log with details.

### PUT /activity_logs/:id

Update a logged run.

### DELETE /activity_logs/:id

Delete a logged run.

### GET /activity_logs/:id/recap

Get or generate AI recap for a run.

**Response (200):**
```json
{
  "recap": {
    "text": "Strong easy run today. 8.2km at 6:00/km — that's actually faster than your prescribed easy pace of 7:20-7:50. Be careful not to run your easy days too fast; recovery is where fitness is built. Otherwise, great volume. You're on track for week 3.",
    "generated_at": "2026-03-01T18:30:00Z"
  }
}
```

---

## Dashboard

### GET /dashboard

Aggregated dashboard data for the current user.

**Response (200):**
```json
{
  "today_workout": { ... },
  "upcoming_workouts": [ ... ],
  "plan_progress": {
    "plan_name": "HM Sub-2:00",
    "current_week": 3,
    "total_weeks": 17,
    "progress_pct": 18,
    "phase": "base"
  },
  "weekly_mileage": [
    { "week": "2026-02-10", "planned_km": 25, "actual_km": 26.5 },
    { "week": "2026-02-17", "planned_km": 27, "actual_km": 24.0 }
  ],
  "streak": {
    "current_weeks": 3,
    "description": "3 weeks hitting your plan"
  }
}
```

---

## Share Cards

### POST /share_cards

Generate a shareable image card.

**Request:**
```json
{
  "card_type": "run",
  "activity_log_id": 1
}
```

**Response (201):**
```json
{
  "share_card": {
    "id": 1,
    "card_type": "run",
    "image_url": "/share_cards/1.png",
    "ai_caption": "8.2km easy run | 6:00/km pace | Week 3 of HM training"
  }
}
```

**Card types:** `run`, `weekly_summary`, `plan_progress`, `milestone`

---

## Stats

### GET /stats/summary

**Query params:** `?period=month` or `?period=week` or `?from=&to=`

**Response (200):**
```json
{
  "period": "2026-02",
  "total_distance_km": 112.5,
  "total_duration_secs": 40500,
  "total_runs": 12,
  "avg_pace_secs": 360,
  "avg_effort": 5.8,
  "longest_run_km": 16
}
```

---

## Error Responses

All errors follow this format:

**400 Bad Request:**
```json
{
  "error": {
    "code": "validation_failed",
    "message": "Validation failed",
    "details": { "distance_km": ["must be greater than 0"] }
  }
}
```

**401 Unauthorized:**
```json
{
  "error": {
    "code": "unauthorized",
    "message": "Invalid or expired token"
  }
}
```

**404 Not Found:**
```json
{
  "error": {
    "code": "not_found",
    "message": "Training plan not found"
  }
}
```

**429 Too Many Requests:**
```json
{
  "error": {
    "code": "rate_limited",
    "message": "Plan generation limit reached (3/day)"
  }
}
```
