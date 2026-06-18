import { sql } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

/** Movements used to tag/filter workouts (e.g. Thruster, Pull-up, Run). */
export const movements = sqliteTable("movements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  category: text("category"),
});

export const WORKOUT_TYPES = [
  "AMRAP",
  "ForTime",
  "EMOM",
  "Strength",
  "Other",
] as const;
export type WorkoutType = (typeof WORKOUT_TYPES)[number];

export const SCORE_TYPES = ["time", "reps", "rounds", "weight", "none"] as const;
export type ScoreType = (typeof SCORE_TYPES)[number];

/** Reusable, shared workout definitions ("WODs"). */
export const workouts = sqliteTable("workouts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull().default("Other"),
  timeCapSeconds: integer("time_cap_seconds"),
  scoreType: text("score_type").notNull().default("none"),
  /** The prescribed (Rx) movements / reps / loads, free-form. */
  prescription: text("prescription"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/** Join table powering "filter workouts by movement". */
export const workoutMovements = sqliteTable(
  "workout_movements",
  {
    workoutId: integer("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    movementId: integer("movement_id")
      .notNull()
      .references(() => movements.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.workoutId, t.movementId] })],
);

/** A library workout placed on a specific day, per profile. */
export const scheduledWorkouts = sqliteTable("scheduled_workouts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workoutId: integer("workout_id")
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  profile: text("profile").notNull(),
  /** ISO date, YYYY-MM-DD. */
  date: text("date").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/** What was actually done for a scheduled workout (prescribed-vs-actual). */
export const results = sqliteTable("results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scheduledWorkoutId: integer("scheduled_workout_id")
    .notNull()
    .unique()
    .references(() => scheduledWorkouts.id, { onDelete: "cascade" }),
  profile: text("profile").notNull(),
  /** Did it exactly as prescribed? */
  rx: integer("rx", { mode: "boolean" }).notNull().default(false),
  /** The actual/scaled version performed (pre-filled from prescription, then edited). */
  performed: text("performed"),
  /** Flexible score: e.g. "12:34", "5 rounds + 8", "185 lb". */
  score: text("score"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Movement = typeof movements.$inferSelect;
export type Workout = typeof workouts.$inferSelect;
export type ScheduledWorkout = typeof scheduledWorkouts.$inferSelect;
export type Result = typeof results.$inferSelect;
