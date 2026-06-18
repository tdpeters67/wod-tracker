# WOD Tracker

A private workout tracker / scheduler for two people. Maintain a shared library of
CrossFit-style workouts ("WODs"), schedule them onto each person's calendar, and log
what you actually did vs. what was prescribed. Filter the library by movement.

Built with **Next.js (App Router)**, **Tailwind CSS**, **Drizzle ORM**, and
**Turso (libSQL)**. Mobile-first. Deploys to **Vercel**.

## How it works

- One **shared password** gates the whole site.
- After login you pick **Tomas's calendar**, **Susan's calendar**, or the **shared WOD library**.
- The **library** of workouts and movements is shared; each person's **schedule and logged
  results are separate**.

To change the two profiles, edit `lib/profiles.ts`.

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` (copy from `.env.example`). For local dev a file-based SQLite DB
   works with no token:

   ```
   TURSO_DATABASE_URL=file:local.db
   TURSO_AUTH_TOKEN=
   APP_PASSWORD=your-shared-password
   AUTH_SECRET=<random 32+ byte hex>
   ```

   Generate a secret:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. Create the schema and seed the starter movements:

   ```bash
   npm run db:push   # apply the Drizzle schema
   npm run seed      # insert ~40 starter CrossFit movements
   ```

4. Run it:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## Scripts

| Script             | What it does                                    |
| ------------------ | ----------------------------------------------- |
| `npm run dev`      | Dev server                                      |
| `npm run build`    | Production build                                |
| `npm run db:push`  | Push the Drizzle schema to the DB               |
| `npm run db:studio`| Drizzle Studio (browse the DB)                  |
| `npm run seed`     | Seed the starter movement list                  |

## Deploying to Vercel

1. **Create a Turso database** (free tier):

   ```bash
   turso db create wod-tracker
   turso db show wod-tracker --url        # -> TURSO_DATABASE_URL
   turso db tokens create wod-tracker     # -> TURSO_AUTH_TOKEN
   ```

2. **Push the schema** to the remote DB, then seed it. Point your local env at the
   remote Turso URL/token (temporarily, or via a separate env) and run:

   ```bash
   npm run db:push
   npm run seed
   ```

3. **Import the repo into Vercel** and set these Environment Variables (Production):

   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `APP_PASSWORD`
   - `AUTH_SECRET`

4. Deploy. The shared password is `APP_PASSWORD`; share it with the two of you.

## Data model

- `movements` — taggable movements (Thruster, Pull-up, Run, …).
- `workouts` — the reusable WOD definitions (type, score type, time cap, Rx prescription).
- `workout_movements` — links workouts ↔ movements (powers the movement filter).
- `scheduled_workouts` — a workout placed on a date, per profile.
- `results` — what was actually done for a scheduled workout (Rx flag, scaled version, score, notes).
