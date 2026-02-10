# Stride — Build Plan

> Track progress by checking boxes. Update CLAUDE.md status when moving between phases.

## Phase 1: Foundation

### 1.1 Project Scaffolding
- [x] Initialize Rails 7.1 API-mode app (`backend/`)
- [x] Initialize Next.js 15 app with TypeScript + Tailwind + shadcn/ui (`frontend/`)
- [x] Configure CORS (Rails → Next.js)
- [x] Set up PostgreSQL database
- [x] Configure environment variables (.env files)
- [x] Add .gitignore for both apps
- [ ] PWA manifest + service worker setup (Next.js)

### 1.2 Authentication
- [ ] Install and configure Devise (Rails)
- [ ] Set up JWT token authentication (devise-jwt or custom)
- [ ] Auth endpoints: POST /signup, POST /login, DELETE /logout, GET /me
- [ ] Frontend: Auth context/provider
- [ ] Frontend: Login page
- [ ] Frontend: Sign up page
- [ ] Frontend: Protected route wrapper
- [ ] Token refresh handling

### 1.3 User Profile & Onboarding
- [ ] RunnerProfile model + migration
- [ ] RaceHistory model + migration
- [ ] Profile API endpoints (CRUD)
- [ ] Frontend: Onboarding flow (multi-step form)
  - [ ] Step 1: Basic info (name, experience level)
  - [ ] Step 2: Current fitness (weekly mileage, recent races)
  - [ ] Step 3: Training preferences (available days, long run day)
  - [ ] Step 4: Injury notes
- [ ] Frontend: Profile view/edit page

## Phase 2: Core — AI Training Plans

### 2.1 Training Plan Data Model
- [ ] TrainingPlan model + migration
- [ ] TrainingWeek model + migration
- [ ] PlannedWorkout model + migration
- [ ] Seed data: workout types, phases

### 2.2 AI Plan Generation
- [ ] Claude API integration (service object)
- [ ] TrainingPlanGenerator service
  - [ ] Prompt engineering: plan generation
  - [ ] Pace calculator (based on race history)
  - [ ] Parse AI response into structured plan data
  - [ ] Store generated plan in database
- [ ] API endpoint: POST /training_plans/generate
- [ ] API endpoint: GET /training_plans/:id
- [ ] API endpoint: GET /training_plans (list user's plans)
- [ ] Error handling & rate limiting

### 2.3 Training Calendar UI
- [ ] Frontend: Calendar component (month view)
- [ ] Frontend: Calendar component (week view)
- [ ] Color-coded workout types
- [ ] Planned vs completed visual overlay
- [ ] Click-to-expand workout details
- [ ] Current day highlight
- [ ] Navigate between weeks/months

### 2.4 Weekly Review & Adjust
- [ ] WeeklyReview model + migration
- [ ] AI weekly review service (compare planned vs actual)
- [ ] API endpoint: POST /training_weeks/:id/review
- [ ] Frontend: Weekly review UI (show analysis + suggested changes)
- [ ] Apply adjustments to upcoming weeks

## Phase 3: Training Log

### 3.1 Run Logging
- [ ] ActivityLog model + migration
- [ ] API endpoints: CRUD for activity logs
- [ ] Frontend: Quick log form (distance, duration, effort, notes)
- [ ] Auto-calculate pace from distance + duration
- [ ] Link logged run to planned workout
- [ ] Workout completion status tracking

### 3.2 Run History & Stats
- [ ] Frontend: Run history list view
- [ ] Frontend: Individual run detail view
- [ ] Weekly/monthly mileage summaries
- [ ] Planned vs actual comparison stats

## Phase 4: Social & Sharing

### 4.1 AI Run Recaps
- [ ] RunRecapService (Claude API)
- [ ] Generate recap after each logged run
- [ ] API endpoint: GET /activity_logs/:id/recap
- [ ] Frontend: Display recap on run detail page

### 4.2 Shareable Cards
- [ ] Card generation engine (HTML → image via canvas/server-side)
- [ ] Run card template (stats + branding)
- [ ] Training progress card template
- [ ] Streak/milestone card template
- [ ] Frontend: Share button + download image
- [ ] Auto-detect streaks and milestones

## Phase 5: Dashboard & Polish

### 5.1 Dashboard
- [ ] Frontend: Dashboard layout
- [ ] Today's workout widget
- [ ] Upcoming workouts (next 3 days)
- [ ] Training plan progress bar
- [ ] Weekly mileage chart (last 8 weeks)
- [ ] Streak counter
- [ ] Quick-log button

### 5.2 Polish & UX
- [ ] Loading states and skeletons
- [ ] Error handling (API failures, network issues)
- [ ] Empty states (no plan yet, no runs yet)
- [ ] Responsive design audit (mobile, tablet, desktop)
- [ ] Performance optimization (lazy loading, caching)
- [ ] PWA: offline support for viewing plan
- [ ] Animations and micro-interactions

## Phase 6: Deploy & Handoff

### 6.1 Deployment
- [ ] Deploy Rails API to Render/Fly.io
- [ ] Deploy Next.js to Vercel
- [ ] Set up production PostgreSQL
- [ ] Environment variables and secrets
- [ ] Custom domain (if desired)
- [ ] SSL / HTTPS

### 6.2 Documentation & Handoff
- [ ] README with setup instructions
- [ ] Deployment documentation
- [ ] V2 feature roadmap document
- [ ] Architecture decision records
