# 75 Hard PMS-Safe

A full-stack habit and challenge tracking application with a PMS-Safe mode. Users can log daily tasks, track streaks, and view progress analytics. The PMS-Safe mode dynamically adjusts expectations and language during a configurable PMS window, while preserving structure and accountability.

## Tech Stack
- Frontend: React, Vite, TypeScript
- UI: Tailwind CSS, shadcn/ui
- Backend: Supabase (Authentication, Postgres, Row-Level Security)

## Features
- Email/password authentication
- Automatic seeding of Day 1–75 on first login
- Daily checklist with required tasks and completion rules
- PMS-Safe configuration (cycle length, PMS window, water goal adjustments)
- Progress analytics including completion rate, streaks, and task consistency

Note: This project uses Supabase for authentication and data storage. Environment variables must be configured before running locally.

## Local Development
```bash
npm install
npm run dev



