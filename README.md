# 75 Hard PMS-Safe

A full-stack habit + challenge tracker with a PMS-Safe mode. Users can log daily tasks, track streaks, and view progress analytics. PMS-Safe adjusts expectations and language during a configurable PMS window.

## Tech Stack
- React + Vite + TypeScript
- TailwindCSS + shadcn/ui
- Supabase (Auth + Postgres + RLS)

## Features
- Email/password auth
- Auto-seeds Day 1–75 on first login
- Daily checklist with required tasks + completion rules
- PMS-Safe settings (cycle length, PMS window, water goal)
- Progress view (completion rate, streaks, task consistency)

## Local Development
1. Install deps
```bash
npm install
