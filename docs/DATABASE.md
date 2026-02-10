# Stride — Database Schema

## Entity Relationship Diagram

```
User 1──1 RunnerProfile
User 1──* RaceHistory
User 1──* TrainingPlan
User 1──* ActivityLog

TrainingPlan 1──* TrainingWeek
TrainingWeek 1──* PlannedWorkout
TrainingWeek 1──1 WeeklyReview

PlannedWorkout 1──? ActivityLog (a logged run may link to a planned workout)
ActivityLog 1──? RunRecap
```

## Tables

### users

Core auth table managed by Devise.

| Column              | Type      | Constraints              |
| ------------------- | --------- | ------------------------ |
| id                  | bigint    | PK                       |
| email               | string    | NOT NULL, UNIQUE, INDEX  |
| encrypted_password  | string    | NOT NULL                 |
| name                | string    | NOT NULL                 |
| created_at          | timestamp | NOT NULL                 |
| updated_at          | timestamp | NOT NULL                 |

Devise also adds: reset_password_token, reset_password_sent_at, remember_created_at, etc.

---

### runner_profiles

One-to-one with users. Stores running-specific data.

| Column                | Type    | Constraints             |
| --------------------- | ------- | ----------------------- |
| id                    | bigint  | PK                      |
| user_id               | bigint  | FK → users, NOT NULL, UNIQUE, INDEX |
| experience_level      | integer | NOT NULL (enum: 0=beginner, 1=intermediate, 2=advanced) |
| current_weekly_km     | decimal | NOT NULL                |
| available_days        | integer | NOT NULL (3-7)          |
| preferred_long_run_day| integer | NOT NULL (0=Sun..6=Sat) |
| injury_notes          | text    | nullable                |
| created_at            | timestamp | NOT NULL              |
| updated_at            | timestamp | NOT NULL              |

---

### race_histories

Past race results for fitness estimation.

| Column           | Type    | Constraints                        |
| ---------------- | ------- | ---------------------------------- |
| id               | bigint  | PK                                 |
| user_id          | bigint  | FK → users, NOT NULL, INDEX        |
| race_name        | string  | nullable                           |
| distance_km      | decimal | NOT NULL                           |
| finish_time_secs | integer | NOT NULL (stored as total seconds) |
| race_date        | date    | NOT NULL                           |
| notes            | text    | nullable                           |
| created_at       | timestamp | NOT NULL                         |
| updated_at       | timestamp | NOT NULL                         |

---

### training_plans

AI-generated training plans.

| Column             | Type    | Constraints                        |
| ------------------ | ------- | ---------------------------------- |
| id                 | bigint  | PK                                 |
| user_id            | bigint  | FK → users, NOT NULL, INDEX        |
| name               | string  | NOT NULL (e.g., "HM Sub-2:00")    |
| goal_distance_km   | decimal | NOT NULL                           |
| goal_time_secs     | integer | NOT NULL (A goal, in seconds)      |
| goal_time_b_secs   | integer | nullable (B goal, in seconds)      |
| race_date          | date    | NOT NULL                           |
| start_date         | date    | NOT NULL                           |
| end_date           | date    | NOT NULL                           |
| total_weeks        | integer | NOT NULL                           |
| status             | integer | NOT NULL (enum: 0=active, 1=completed, 2=cancelled) |
| ai_model_used      | string  | NOT NULL (track which model generated it) |
| generation_prompt   | text    | nullable (store prompt for debugging) |
| created_at         | timestamp | NOT NULL                         |
| updated_at         | timestamp | NOT NULL                         |

**Index**: (user_id, status) — quickly find active plan.

---

### training_weeks

Individual weeks within a training plan.

| Column            | Type    | Constraints                             |
| ----------------- | ------- | --------------------------------------- |
| id                | bigint  | PK                                      |
| training_plan_id  | bigint  | FK → training_plans, NOT NULL, INDEX    |
| week_number       | integer | NOT NULL                                |
| phase             | integer | NOT NULL (enum: 0=base, 1=build, 2=peak, 3=taper, 4=recovery) |
| target_distance_km| decimal | NOT NULL                                |
| focus             | string  | NOT NULL (e.g., "Aerobic base building")|
| notes             | text    | nullable                                |
| start_date        | date    | NOT NULL                                |
| end_date          | date    | NOT NULL                                |
| status            | integer | NOT NULL (enum: 0=upcoming, 1=current, 2=completed) |
| created_at        | timestamp | NOT NULL                              |
| updated_at        | timestamp | NOT NULL                              |

**Index**: (training_plan_id, week_number)

---

### planned_workouts

Individual workouts prescribed by the AI within a training week.

| Column              | Type    | Constraints                            |
| ------------------- | ------- | -------------------------------------- |
| id                  | bigint  | PK                                     |
| training_week_id    | bigint  | FK → training_weeks, NOT NULL, INDEX   |
| day_of_week         | integer | NOT NULL (0=Sunday..6=Saturday)        |
| scheduled_date      | date    | NOT NULL, INDEX                        |
| workout_type        | integer | NOT NULL (enum: see below)             |
| title               | string  | NOT NULL (e.g., "Easy Run")            |
| description         | text    | NOT NULL (full workout instructions)   |
| distance_km         | decimal | nullable (rest days have no distance)  |
| duration_mins       | integer | nullable                               |
| target_pace_secs    | integer | nullable (pace per km in seconds)      |
| target_pace_range   | string  | nullable (e.g., "6:20-6:40")          |
| status              | integer | NOT NULL (enum: 0=pending, 1=completed, 2=skipped, 3=modified) |
| created_at          | timestamp | NOT NULL                             |
| updated_at          | timestamp | NOT NULL                             |

**Workout types** (enum):
- 0: rest
- 1: easy
- 2: recovery
- 3: tempo
- 4: interval
- 5: long_run
- 6: race_pace
- 7: fartlek
- 8: hill_repeats
- 9: cross_training
- 10: race

---

### activity_logs

Actual completed runs logged by the user.

| Column             | Type    | Constraints                            |
| ------------------ | ------- | -------------------------------------- |
| id                 | bigint  | PK                                     |
| user_id            | bigint  | FK → users, NOT NULL, INDEX            |
| planned_workout_id | bigint  | FK → planned_workouts, nullable, INDEX |
| date               | date    | NOT NULL, INDEX                        |
| distance_km        | decimal | NOT NULL                               |
| duration_secs      | integer | NOT NULL                               |
| avg_pace_secs      | integer | NOT NULL (auto-calculated: duration/distance per km) |
| effort_level       | integer | NOT NULL (1-10)                        |
| workout_type       | integer | NOT NULL (same enum as planned_workouts) |
| notes              | text    | nullable                               |
| heart_rate_avg     | integer | nullable (for future GPS integration)  |
| heart_rate_max     | integer | nullable                               |
| created_at         | timestamp | NOT NULL                             |
| updated_at         | timestamp | NOT NULL                             |

**Index**: (user_id, date)

---

### weekly_reviews

AI-generated weekly analysis and plan adjustments.

| Column            | Type    | Constraints                            |
| ----------------- | ------- | -------------------------------------- |
| id                | bigint  | PK                                     |
| training_week_id  | bigint  | FK → training_weeks, NOT NULL, UNIQUE, INDEX |
| compliance_pct    | integer | NOT NULL (% of planned workouts completed) |
| total_actual_km   | decimal | NOT NULL                               |
| total_planned_km  | decimal | NOT NULL                               |
| user_notes        | text    | nullable (user's self-assessment)      |
| ai_analysis       | text    | NOT NULL                               |
| ai_adjustments    | jsonb   | nullable (structured adjustment data)  |
| adjustments_applied| boolean| NOT NULL, DEFAULT false                |
| created_at        | timestamp | NOT NULL                             |
| updated_at        | timestamp | NOT NULL                             |

---

### run_recaps

AI-generated post-run commentary.

| Column          | Type    | Constraints                              |
| --------------- | ------- | ---------------------------------------- |
| id              | bigint  | PK                                       |
| activity_log_id | bigint  | FK → activity_logs, NOT NULL, UNIQUE, INDEX |
| recap_text      | text    | NOT NULL                                 |
| ai_model_used   | string  | NOT NULL                                 |
| created_at      | timestamp | NOT NULL                               |
| updated_at      | timestamp | NOT NULL                               |

## Notes

- All times stored as **integer seconds** for easy math. Convert to mm:ss in the presentation layer.
- Enums use Rails' built-in `enum` backed by integers for performance.
- `jsonb` used for flexible AI adjustment data (weekly_reviews.ai_adjustments).
- Indexes on all foreign keys and commonly queried columns.
- Soft deletes not used in V1 — hard delete with confirmation in UI.
