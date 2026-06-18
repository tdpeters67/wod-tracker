@AGENTS.md

# WOD Tracker — project notes

Private two-person workout tracker. Next.js (App Router) + Tailwind v4 + Drizzle + Turso (libSQL).

## Layout
- `app/login` — shared-password gate. `app/page.tsx` — post-login chooser (Tomas / Susan / Library).
- `app/(app)/*` — authed section (schedule, workouts, movements) with shared header + bottom nav.
- `lib/db/` — Drizzle schema + client + seed. `lib/queries.ts` — read helpers.
- `lib/actions/` — server actions (auth, profile, workouts, movements, schedule).
- `lib/auth.ts` — HMAC session cookie (Web Crypto, works in `proxy.ts`). `lib/profiles.ts` — the two profiles.
- `proxy.ts` — auth middleware (Next 16 renamed `middleware` → `proxy`).

## Conventions
- Auth = one shared `APP_PASSWORD`; profile (`tomas`/`susan`) is a separate cookie set by the chooser.
- Library (workouts/movements) is shared; `scheduled_workouts` + `results` are scoped by profile.
- Tailwind v4: colors are `@theme` tokens in `globals.css` → use named utilities (`bg-surface`,
  `text-muted`, `border-border`), NOT `bg-[--color-...]`. `@apply` can't reference custom classes.
- Don't rely on SQLite FK cascade (libSQL doesn't enforce it) — delete dependents explicitly in actions.

## Commands
`npm run dev` · `npm run build` · `npm run db:push` · `npm run seed`
