import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  movements,
  results,
  scheduledWorkouts,
  workoutMovements,
  workouts,
  type Movement,
  type Result,
  type Workout,
} from "@/lib/db/schema";
import type { ProfileId } from "@/lib/profiles";

export async function getMovements(): Promise<Movement[]> {
  return db.select().from(movements).orderBy(movements.category, movements.name);
}

export type WorkoutWithMovements = Workout & { movements: Movement[] };

/** Map of workoutId -> its movements, for a set of workouts. */
async function movementsForWorkouts(
  workoutIds: number[],
): Promise<Map<number, Movement[]>> {
  const map = new Map<number, Movement[]>();
  if (workoutIds.length === 0) return map;

  const rows = await db
    .select({ workoutId: workoutMovements.workoutId, movement: movements })
    .from(workoutMovements)
    .innerJoin(movements, eq(workoutMovements.movementId, movements.id))
    .where(inArray(workoutMovements.workoutId, workoutIds))
    .orderBy(movements.name);

  for (const row of rows) {
    const list = map.get(row.workoutId) ?? [];
    list.push(row.movement);
    map.set(row.workoutId, list);
  }
  return map;
}

/**
 * List workouts, optionally filtered to those containing ALL of the given
 * movement ids.
 */
export async function getWorkouts(
  movementIds: number[] = [],
): Promise<WorkoutWithMovements[]> {
  let ids: number[] | null = null;

  if (movementIds.length > 0) {
    const matching = await db
      .select({ workoutId: workoutMovements.workoutId })
      .from(workoutMovements)
      .where(inArray(workoutMovements.movementId, movementIds))
      .groupBy(workoutMovements.workoutId)
      .having(
        sql`count(distinct ${workoutMovements.movementId}) = ${movementIds.length}`,
      );
    ids = matching.map((m) => m.workoutId);
    if (ids.length === 0) return [];
  }

  const list = await db
    .select()
    .from(workouts)
    .where(ids ? inArray(workouts.id, ids) : undefined)
    .orderBy(workouts.name);

  const moveMap = await movementsForWorkouts(list.map((w) => w.id));
  return list.map((w) => ({ ...w, movements: moveMap.get(w.id) ?? [] }));
}

export async function getWorkout(
  id: number,
): Promise<WorkoutWithMovements | null> {
  const [w] = await db.select().from(workouts).where(eq(workouts.id, id));
  if (!w) return null;
  const moveMap = await movementsForWorkouts([id]);
  return { ...w, movements: moveMap.get(id) ?? [] };
}

export type ScheduledEntry = {
  scheduledId: number;
  date: string;
  workout: Workout;
  result: Result | null;
};

/** Scheduled workouts for a profile within an (inclusive) date range. */
export async function getSchedule(
  profile: ProfileId,
  fromDate: string,
  toDate: string,
): Promise<ScheduledEntry[]> {
  const rows = await db
    .select({
      scheduled: scheduledWorkouts,
      workout: workouts,
      result: results,
    })
    .from(scheduledWorkouts)
    .innerJoin(workouts, eq(scheduledWorkouts.workoutId, workouts.id))
    .leftJoin(results, eq(results.scheduledWorkoutId, scheduledWorkouts.id))
    .where(
      and(
        eq(scheduledWorkouts.profile, profile),
        sql`${scheduledWorkouts.date} >= ${fromDate}`,
        sql`${scheduledWorkouts.date} <= ${toDate}`,
      ),
    )
    .orderBy(scheduledWorkouts.date, scheduledWorkouts.createdAt);

  return rows.map((r) => ({
    scheduledId: r.scheduled.id,
    date: r.scheduled.date,
    workout: r.workout,
    result: r.result,
  }));
}

export async function getScheduledEntry(
  scheduledId: number,
  profile: ProfileId,
): Promise<ScheduledEntry | null> {
  const [row] = await db
    .select({
      scheduled: scheduledWorkouts,
      workout: workouts,
      result: results,
    })
    .from(scheduledWorkouts)
    .innerJoin(workouts, eq(scheduledWorkouts.workoutId, workouts.id))
    .leftJoin(results, eq(results.scheduledWorkoutId, scheduledWorkouts.id))
    .where(
      and(
        eq(scheduledWorkouts.id, scheduledId),
        eq(scheduledWorkouts.profile, profile),
      ),
    );

  if (!row) return null;
  return {
    scheduledId: row.scheduled.id,
    date: row.scheduled.date,
    workout: row.workout,
    result: row.result,
  };
}
