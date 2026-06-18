"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { results, scheduledWorkouts } from "@/lib/db/schema";
import { isProfileId, PROFILE_COOKIE } from "@/lib/profiles";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function scheduleWorkout(formData: FormData) {
  const workoutId = Number(formData.get("workoutId"));
  const profile = String(formData.get("profile") ?? "");
  const date = String(formData.get("date") ?? "");

  if (!Number.isInteger(workoutId) || !isProfileId(profile) || !ISO_DATE.test(date)) {
    redirect("/workouts");
  }

  await db.insert(scheduledWorkouts).values({ workoutId, profile, date });

  // Switch context to the chosen calendar so the user sees what they just added.
  const store = await cookies();
  store.set(PROFILE_COOKIE, profile, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/schedule");
  redirect(`/schedule?d=${date}`);
}

export async function unscheduleWorkout(scheduledId: number, date: string) {
  await db.delete(results).where(eq(results.scheduledWorkoutId, scheduledId));
  await db.delete(scheduledWorkouts).where(eq(scheduledWorkouts.id, scheduledId));
  revalidatePath("/schedule");
  redirect(`/schedule?d=${date}`);
}

export async function saveResult(
  scheduledId: number,
  date: string,
  formData: FormData,
) {
  const [sched] = await db
    .select()
    .from(scheduledWorkouts)
    .where(eq(scheduledWorkouts.id, scheduledId));
  if (!sched) redirect("/schedule");

  const rx = formData.get("rx") === "on";
  const performed = String(formData.get("performed") ?? "").trim() || null;
  const score = String(formData.get("score") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const [existing] = await db
    .select({ id: results.id })
    .from(results)
    .where(eq(results.scheduledWorkoutId, scheduledId));

  if (existing) {
    await db
      .update(results)
      .set({ rx, performed, score, notes })
      .where(eq(results.id, existing.id));
  } else {
    await db.insert(results).values({
      scheduledWorkoutId: scheduledId,
      profile: sched.profile,
      rx,
      performed,
      score,
      notes,
    });
  }

  revalidatePath("/schedule");
  redirect(`/schedule?d=${date}`);
}

export async function deleteResult(scheduledId: number, date: string) {
  await db.delete(results).where(eq(results.scheduledWorkoutId, scheduledId));
  revalidatePath("/schedule");
  redirect(`/schedule?d=${date}`);
}
