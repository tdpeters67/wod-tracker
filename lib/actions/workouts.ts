"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  results,
  scheduledWorkouts,
  SCORE_TYPES,
  WORKOUT_TYPES,
  workoutMovements,
  workouts,
  type ScoreType,
  type WorkoutType,
} from "@/lib/db/schema";

function parseForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const prescription = String(formData.get("prescription") ?? "").trim() || null;

  const typeRaw = String(formData.get("type") ?? "Other");
  const type: WorkoutType = (WORKOUT_TYPES as readonly string[]).includes(typeRaw)
    ? (typeRaw as WorkoutType)
    : "Other";

  const scoreRaw = String(formData.get("scoreType") ?? "none");
  const scoreType: ScoreType = (SCORE_TYPES as readonly string[]).includes(scoreRaw)
    ? (scoreRaw as ScoreType)
    : "none";

  const capMinutes = Number(formData.get("timeCapMinutes"));
  const timeCapSeconds =
    Number.isFinite(capMinutes) && capMinutes > 0
      ? Math.round(capMinutes * 60)
      : null;

  const movementIds = formData
    .getAll("movements")
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n) && n > 0);

  return { name, description, prescription, type, scoreType, timeCapSeconds, movementIds };
}

async function setMovements(workoutId: number, movementIds: number[]) {
  await db
    .delete(workoutMovements)
    .where(eq(workoutMovements.workoutId, workoutId));
  if (movementIds.length > 0) {
    await db
      .insert(workoutMovements)
      .values(movementIds.map((movementId) => ({ workoutId, movementId })));
  }
}

export async function createWorkout(formData: FormData) {
  const data = parseForm(formData);
  if (!data.name) redirect("/workouts/new?error=name");

  const [created] = await db
    .insert(workouts)
    .values({
      name: data.name,
      description: data.description,
      prescription: data.prescription,
      type: data.type,
      scoreType: data.scoreType,
      timeCapSeconds: data.timeCapSeconds,
    })
    .returning({ id: workouts.id });

  await setMovements(created.id, data.movementIds);
  revalidatePath("/workouts");
  redirect(`/workouts/${created.id}`);
}

export async function updateWorkout(id: number, formData: FormData) {
  const data = parseForm(formData);
  if (!data.name) redirect(`/workouts/${id}/edit?error=name`);

  await db
    .update(workouts)
    .set({
      name: data.name,
      description: data.description,
      prescription: data.prescription,
      type: data.type,
      scoreType: data.scoreType,
      timeCapSeconds: data.timeCapSeconds,
    })
    .where(eq(workouts.id, id));

  await setMovements(id, data.movementIds);
  revalidatePath("/workouts");
  revalidatePath(`/workouts/${id}`);
  redirect(`/workouts/${id}`);
}

export async function deleteWorkout(id: number) {
  // Clean up dependents explicitly (libSQL FK cascade is not guaranteed).
  const scheds = await db
    .select({ id: scheduledWorkouts.id })
    .from(scheduledWorkouts)
    .where(eq(scheduledWorkouts.workoutId, id));
  const schedIds = scheds.map((s) => s.id);
  if (schedIds.length > 0) {
    await db.delete(results).where(inArray(results.scheduledWorkoutId, schedIds));
  }
  await db.delete(scheduledWorkouts).where(eq(scheduledWorkouts.workoutId, id));
  await db.delete(workoutMovements).where(eq(workoutMovements.workoutId, id));
  await db.delete(workouts).where(eq(workouts.id, id));

  revalidatePath("/workouts");
  redirect("/workouts");
}
