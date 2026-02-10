# Stride — Technical Architecture

## System Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│                  │  JSON   │                  │         │             │
│   Next.js 15    │ ◄─────► │  Rails 7.2 API   │ ◄─────► │ PostgreSQL  │
│   (Frontend)     │  REST   │  (Backend)       │   ORM   │             │
│                  │         │                  │         │             │
└─────────────────┘         └────────┬─────────┘         └─────────────┘
                                     │
                                     │ API calls
                                     ▼
                            ┌──────────────────┐
                            │                  │
                            │   Claude API     │
                            │   (Anthropic)    │
                            │                  │
                            └──────────────────┘
```

## Frontend Architecture (Next.js 15)

### App Router Structure

```
frontend/src/
├── app/
│   ├── layout.tsx                 # Root layout (providers, nav)
│   ├── page.tsx                   # Landing / redirect to dashboard
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (app)/                     # Authenticated routes
│   │   ├── layout.tsx             # App shell (sidebar, header)
│   │   ├── dashboard/page.tsx
│   │   ├── plan/
│   │   │   ├── page.tsx           # View current plan
│   │   │   ├── new/page.tsx       # Generate new plan
│   │   │   └── [id]/page.tsx      # Plan detail
│   │   ├── calendar/page.tsx
│   │   ├── log/
│   │   │   ├── page.tsx           # Run history
│   │   │   └── new/page.tsx       # Log a run
│   │   ├── profile/page.tsx
│   │   └── onboarding/page.tsx
│   └── globals.css
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── calendar/                  # Calendar components
│   ├── cards/                     # Share card components
│   └── forms/                     # Form components
├── lib/
│   ├── api.ts                     # API client (fetch wrapper)
│   ├── auth.ts                    # Auth utilities
│   └── utils.ts                   # Helpers
├── hooks/
│   ├── useAuth.ts
│   ├── useTrainingPlan.ts
│   └── useActivityLogs.ts
└── types/
    └── index.ts                   # TypeScript interfaces
```

### State Management

- **Server state**: React Query (TanStack Query) for API data caching & synchronization
- **Client state**: React Context for auth/user state
- **No Redux** — the app is simple enough to avoid it

### Styling

- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for base components (buttons, inputs, dialogs, cards)
- **Custom design tokens** for brand colors, spacing
- **Mobile-first** responsive design

## Backend Architecture (Rails 7.2 API)

### Directory Structure

```
backend/
├── app/
│   ├── controllers/
│   │   └── api/
│   │       └── v1/
│   │           ├── auth_controller.rb
│   │           ├── users_controller.rb
│   │           ├── runner_profiles_controller.rb
│   │           ├── training_plans_controller.rb
│   │           ├── training_weeks_controller.rb
│   │           ├── planned_workouts_controller.rb
│   │           ├── activity_logs_controller.rb
│   │           └── weekly_reviews_controller.rb
│   ├── models/
│   │   ├── user.rb
│   │   ├── runner_profile.rb
│   │   ├── race_history.rb
│   │   ├── training_plan.rb
│   │   ├── training_week.rb
│   │   ├── planned_workout.rb
│   │   ├── activity_log.rb
│   │   └── weekly_review.rb
│   ├── services/
│   │   ├── ai/
│   │   │   ├── training_plan_generator.rb
│   │   │   ├── weekly_review_analyzer.rb
│   │   │   ├── run_recap_generator.rb
│   │   │   └── pace_calculator.rb
│   │   └── cards/
│   │       └── share_card_generator.rb
│   └── serializers/
│       ├── training_plan_serializer.rb
│       ├── activity_log_serializer.rb
│       └── ...
├── config/
│   └── routes.rb
├── db/
│   ├── migrate/
│   └── schema.rb
└── spec/
    ├── models/
    ├── requests/
    └── services/
```

### API Versioning

All endpoints namespaced under `/api/v1/` for future-proofing.

### Service Objects Pattern

Business logic lives in service objects, not controllers or models:
- Controllers: handle HTTP, params, auth → delegate to services
- Models: validations, associations, scopes
- Services: business logic, AI calls, complex operations

### Error Handling

Consistent JSON error responses:
```json
{
  "error": {
    "code": "validation_failed",
    "message": "Distance must be greater than 0",
    "details": { "distance_km": ["must be greater than 0"] }
  }
}
```

## Authentication Flow

```
1. User signs up/logs in → POST /api/v1/auth/login
2. Rails validates credentials via Devise
3. Rails generates JWT token (stored in allowlist)
4. Token returned to frontend
5. Frontend stores token in httpOnly cookie or localStorage
6. All subsequent requests include: Authorization: Bearer <token>
7. Rails middleware validates token on each request
8. Token refresh via POST /api/v1/auth/refresh
9. Logout invalidates token: DELETE /api/v1/auth/logout
```

### JWT Token Structure
```json
{
  "sub": 1,           // user_id
  "exp": 1234567890,  // expiry (24h)
  "jti": "uuid"       // unique token ID (for allowlist/blocklist)
}
```

## AI Integration

### Claude API Usage

All AI interactions go through dedicated service objects:

1. **TrainingPlanGenerator** — generates full periodized training plan
   - Input: user profile + goal → structured prompt
   - Output: parsed JSON plan → stored in DB
   - Model: Claude Sonnet 4.5 (fast, cost-effective for structured output)

2. **WeeklyReviewAnalyzer** — analyzes week and suggests adjustments
   - Input: planned workouts + actual logs → analysis prompt
   - Output: analysis text + suggested plan modifications

3. **RunRecapGenerator** — generates post-run commentary
   - Input: logged run + context (plan, recent history) → recap prompt
   - Output: 2-3 sentence personalized recap

### Prompt Strategy

Prompts are stored as templates with variable interpolation. See [AI_STRATEGY.md](AI_STRATEGY.md) for full prompt designs.

### Cost Management

- Cache AI responses (plans don't need regeneration)
- Use Sonnet for most operations (cheaper than Opus)
- Rate limit plan generation (max 3 plans/day per user)
- Run recaps only generated on demand, not automatically

## Deployment Architecture

### Production

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Vercel      │     │  Render /    │     │  PostgreSQL   │
│   (Frontend)  │────►│  Fly.io      │────►│  (Managed)    │
│   CDN + SSR   │     │  (Rails API) │     │               │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Claude API   │
                     └──────────────┘
```

### Environment Variables

**Backend (.env):**
```
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-...
JWT_SECRET_KEY=...
FRONTEND_URL=https://stride-app.vercel.app
RAILS_MASTER_KEY=...
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=https://api.stride-app.com
```

## Performance Considerations

- **API responses**: Keep payloads lean, paginate lists
- **AI calls**: Async where possible, show loading states
- **Database**: Index foreign keys, use eager loading (avoid N+1)
- **Frontend**: React Query caching, optimistic updates for logging
- **Images**: Share card generation is expensive — cache generated cards
