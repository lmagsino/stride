# Stride

AI-powered running coach — simple training plans, smart logging, shareable progress.

## Tech Stack

| Layer      | Tech                                                  |
| ---------- | ----------------------------------------------------- |
| Frontend   | Next.js 15 (App Router), TypeScript, Tailwind, shadcn/ui, PWA |
| Backend    | Ruby on Rails 7.1 (API mode), PostgreSQL              |
| AI         | Claude API (Anthropic) — training plans & run recaps  |
| Auth       | Devise + JWT                                          |
| Deployment | Vercel (frontend) + Render or Fly.io (backend)        |

## Project Structure

```
stride/
├── CLAUDE.md              ← this file (auto-loaded by Claude Code)
├── docs/
│   ├── PRD.md             ← product requirements
│   ├── PLAN.md            ← build plan + progress tracking
│   ├── ARCHITECTURE.md    ← technical design
│   ├── DATABASE.md        ← schema design
│   ├── API.md             ← endpoint specs
│   └── AI_STRATEGY.md     ← AI prompt & plan generation design
├── frontend/              ← Next.js app
└── backend/               ← Rails API app
```

## Current Status

- **Phase**: 1 — Foundation
- **Last completed**: Phase 1.3 — Frontend onboarding flow (4-step form with profile API integration)
- **In progress**: None
- **Next up**: Frontend profile view/edit page, then Phase 2 (AI Training Plans)
- **Known issues**: None
- **See full plan**: [docs/PLAN.md](docs/PLAN.md)

## Conventions

- **Backend**: Rails API mode, RESTful endpoints, snake_case, service objects for business logic
- **Frontend**: Next.js App Router, TypeScript strict, Tailwind for styling, shadcn/ui components
- **API**: JSON:API-ish responses, JWT auth via Authorization header
- **AI calls**: Isolated in service objects (e.g., `TrainingPlanGenerator`, `RunRecapService`)
- **Git**: Conventional commits — `feat:`, `fix:`, `docs:`, `chore:`
- **Testing**: RSpec (backend), Jest + React Testing Library (frontend)

## Key Commands

```bash
# Backend (from /backend)
rails s -p 3001              # start API server
rails db:migrate              # run migrations
bundle exec rspec             # run tests

# Frontend (from /frontend)
npm run dev                   # start dev server (port 3000)
npm run build                 # production build
npm run test                  # run tests
```

## Plugins & Skills

Available plugins to accelerate development. **Always announce to the user when using a plugin.**

| Plugin / Skill        | When to Use                                      |
| --------------------- | ------------------------------------------------ |
| `frontend-design`     | Every UI page and component — polished, production-grade design |
| `/commit`             | After each feature — generate clean commit messages |
| `/review`             | Before moving to next phase — code quality check  |

## Rules

1. **Update this file** after completing each major feature or task
2. **Update `docs/PLAN.md`** checkboxes as tasks are completed
3. **Commit often** with conventional commit messages
4. **Never break the build** — test before committing
5. When resuming a session, read `Current Status` above and `docs/PLAN.md` to know where to pick up
6. **Always announce plugin usage** — tell the user before invoking any plugin/skill
